export const metadata = {
  title: "Gym Workout Tracker API",
  description: "Backend for the Gym Workout Tracker university project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
