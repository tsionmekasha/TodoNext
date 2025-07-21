// Add this at the very top of your test file

import { loginUser } from "../app/api/auth/login/logic";
import { signupUser } from "../app/api/auth/signup/logic";

// Mock the MongoDB clientPromise import
jest.mock("../app/server/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: jest.fn(),
        insertOne: jest.fn(),
      }),
    }),
  }),
}));

const getMockedCollection = () => {
  // Get the mocked collection from the mocked clientPromise
  const client = require("../app/server/mongodb").default;
  return client.then((c: any) => c.db().collection());
};

describe("Auth API", () => {
  describe("Signup", () => {
    it("returns 400 if name/email/password is missing", async () => {
      const result = await signupUser({ name: "", email: "", password: "" });
      expect(result.status).toBe(400);
      expect(result.body.error).toBe("Missing name, email, or password");
    });
  });

  describe("Login", () => {
    it("returns 400 if email/password is missing", async () => {
      const result = await loginUser({ email: "", password: "" });
      expect(result.status).toBe(400);
      expect(result.body.error).toBe("Missing email or password");
    });
  });
});
