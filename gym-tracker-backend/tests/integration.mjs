import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());

const base = (process.env.TEST_API_URL || "http://127.0.0.1:3000/backend/api").replace(
  /\/$/,
  "",
);
const suffix = crypto.randomUUID();
const emails = [
  `gym-test-a-${suffix}@example.com`,
  `gym-test-b-${suffix}@example.com`,
];
const password = crypto.randomBytes(16).toString("hex");
const users = [];
let passed = 0;
async function request(
  path,
  status,
  { method = "GET", body, token, origin } = {},
) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  assert.equal(
    response.status,
    status,
    `${method} ${path}: expected ${status}, got ${response.status}; ${data.error || ""}`,
  );
  passed++;
  return { data, response };
}
try {
  await request("/health", 200);
  await request("/auth/register", 400, { method: "POST", body: {} });
  await request("/auth/register", 400, {
    method: "POST",
    body: { name: "Test", email: "invalid", password },
  });
  await request("/auth/register", 400, {
    method: "POST",
    body: { name: "Test", email: emails[0], password: "short" },
  });
  await request("/auth/register", 400, {
    method: "POST",
    body: { name: "Test", email: emails[0], password: "é".repeat(37) },
  });
  for (let index = 0; index < 2; index++) {
    const registered = await request("/auth/register", 201, {
      method: "POST",
      body: { name: `Integration ${index}`, email: emails[index], password },
    });
    assert.equal(registered.data.user.password, undefined);
    assert.equal(registered.data.user.email, emails[index]);
    const login = await request("/auth/login", 200, {
      method: "POST",
      body: { email: emails[index].toUpperCase(), password },
    });
    assert.ok(login.data.token);
    users.push({ ...login.data.user, token: login.data.token });
  }
  await request("/auth/register", 409, {
    method: "POST",
    body: {
      name: "Duplicate",
      email: ` ${emails[0].toUpperCase()} `,
      password,
    },
  });
  await request("/auth/login", 401, {
    method: "POST",
    body: { email: emails[0], password: "wrong-password" },
  });
  await request("/workouts", 401);
  await request("/workouts", 401, { token: "invalid-token" });
  const me = await request("/auth/me", 200, { token: users[0].token });
  assert.equal(me.data.user.id, users[0].id);
  assert.equal(me.data.user.password, undefined);
  if (process.env.JWT_SECRET) {
    const expired = jwt.sign({}, process.env.JWT_SECRET, {
      subject: users[0].id,
      expiresIn: -1,
    });
    await request("/workouts", 401, { token: expired });
    const forged = jwt.sign({}, crypto.randomBytes(32).toString("hex"), {
      subject: users[0].id,
    });
    await request("/workouts", 401, { token: forged });
  }
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
  const cors = await request("/workouts", 204, {
    method: "OPTIONS",
    origin: allowedOrigin,
  });
  assert.equal(
    cors.response.headers.get("access-control-allow-origin"),
    allowedOrigin,
  );
  await request("/workouts", 403, {
    method: "OPTIONS",
    origin: "https://untrusted.example",
  });
  const values = {
    exercise: "Integration bench press",
    category: "Strength",
    sets: 3,
    reps: 10,
    weight: 45.5,
    duration: 25,
    calories: 150,
    date: "2026-10-07",
  };
  for (const invalid of [
    { sets: -1 },
    { reps: 2.5 },
    { weight: "45" },
    { category: "Invalid" },
    { date: "2026-02-30" },
    { exercise: "" },
    { duration: null },
  ]) {
    await request("/workouts", 400, {
      method: "POST",
      body: { ...values, ...invalid },
      token: users[0].token,
    });
  }
  const created = await request("/workouts", 201, {
    method: "POST",
    body: { ...values, userId: users[1].id },
    token: users[0].token,
  });
  const id = created.data.workout._id;
  assert.equal(created.data.workout.userId, users[0].id);
  const own = await request("/workouts", 200, { token: users[0].token });
  assert.equal(own.data.workouts.length, 1);
  const other = await request("/workouts", 200, { token: users[1].token });
  assert.equal(other.data.workouts.length, 0);
  await request(`/workouts/${id}`, 404, {
    method: "PUT",
    body: values,
    token: users[1].token,
  });
  await request(`/workouts/${id}`, 404, {
    method: "DELETE",
    token: users[1].token,
  });
  await request("/workouts/not-an-id", 400, {
    method: "DELETE",
    token: users[0].token,
  });
  const updated = await request(`/workouts/${id}`, 200, {
    method: "PUT",
    body: { ...values, sets: 5, userId: users[1].id },
    token: users[0].token,
  });
  assert.equal(updated.data.workout.sets, 5);
  assert.equal(updated.data.workout.userId, users[0].id);
  await request(`/workouts/${id}`, 200, {
    method: "DELETE",
    token: users[0].token,
  });
  await request(`/workouts/${id}`, 404, {
    method: "DELETE",
    token: users[0].token,
  });
  const empty = await request("/workouts", 200, { token: users[0].token });
  assert.deepEqual(empty.data.workouts, []);
  // Optional direct database check verifies hashing instead of merely API behavior.
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    const stored = await mongoose.connection
      .collection("users")
      .findOne({ email: emails[0] });
    assert.ok(stored);
    assert.notEqual(stored.password, password);
    assert.ok(await bcrypt.compare(password, stored.password));
    console.log("Password hashing verified against MongoDB.");
  }
  console.log(
    `${passed} API checks passed: auth, validation, JWT, CORS, workout CRUD, and user isolation.`,
  );
} finally {
  // Only this run's randomly named test users and their workouts are removed.
  if (process.env.MONGODB_URI) {
    if (mongoose.connection.readyState !== 1)
      await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection("users");
    const testUsers = await collection
      .find({ email: { $in: emails } })
      .toArray();
    await mongoose.connection
      .collection("workouts")
      .deleteMany({ userId: { $in: testUsers.map((u) => u._id) } });
    await collection.deleteMany({ email: { $in: emails } });
    await mongoose.disconnect();
  }
}
