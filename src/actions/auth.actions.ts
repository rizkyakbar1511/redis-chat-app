"use server";

import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function checkAuthStatus() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) return { success: false };

  const userId = `user:${user.id}`;

  const existingUser = await redis.hgetall(userId);

  // sign up case if user doesn't exist
  if (!existingUser || Object.keys(existingUser).length === 0) {
    const isImageNull = user.picture?.includes("gravatar");
    const image = isImageNull ? "" : user.picture;

    await redis.hset(userId, {
      id: user.id,
      email: user.email,
      name: `${user.given_name} ${user.family_name}`,
      image,
    });
  }

  return { success: true };
}
