import type { NextRequest } from "next/server";

import { forwardPublicPost } from "@/lib/server/bff";

export const POST = (request: NextRequest) =>
  forwardPublicPost(request, "auth/password-reset/confirm/", ["uid", "token", "new_password"]);
