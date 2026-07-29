import React from "react";
import { SignupForm } from "../_components/signup-form";

// Registration is student-only (instructors are promoted manually by an
// admin from /account/users) — the [role] segment is kept only so old
// /register/instructor links still resolve to something instead of 404ing.
const RegisterPage = () => {
  return (
    <div className="w-full flex-col h-screen flex items-center justify-center">
      <div className="container">
        <SignupForm />
      </div>
    </div>
  );
};

export default RegisterPage;
