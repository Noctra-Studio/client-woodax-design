import { Fraunces } from "next/font/google";

// Extra axes require the variable file (weight omitted → "variable").
// Design applies 300 on h1 and 400 on h2/h3.
export const fraunces = Fraunces({
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
});
