"use server";

import { Message } from "@/db/dummy";
import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { pusherServer } from "@/lib/pusher";

type sendMessageActionArgs = {
  content: string;
  receiverId: string;
  messageType: "text" | "image";
};

export async function sendMessageAction({
  content,
  receiverId,
  messageType,
}: sendMessageActionArgs) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return { success: false, message: "User not authenticated" };

  const senderId = user.id;

  const conversationId = `conversation:${[senderId, receiverId].sort().join(":")}`;

  const isConversationExist = await redis.exists(conversationId);

  if (!isConversationExist) {
    await redis.hset(conversationId, {
      participant1: senderId,
      participant2: receiverId,
    });
    await redis.sadd(`user:${senderId}:conversations`, conversationId);
    await redis.sadd(`user:${receiverId}:conversations`, conversationId);
  }

  // generate random message id
  const messageId = `message:${Date.now()}:${crypto.randomUUID()}`;
  const timestamp = Date.now();

  // store message hash in redis
  await redis.hset(messageId, {
    senderId,
    content,
    messageType,
    timestamp,
  });

  await redis.zadd(`${conversationId}:messages`, {
    score: timestamp,
    member: JSON.stringify(messageId),
  });

  const channelName = `${senderId}_${receiverId}`.split("_").sort().join("_");

  await pusherServer?.trigger(channelName, "newMessage", {
    message: { senderId, content, messageType, timestamp },
  });

  return { success: true, conversationId, messageId };
}

export async function getMessages(selectedUserId: string, currentUserId: string) {
  const conversationId = `conversation:${[currentUserId, selectedUserId].sort().join(":")}`;
  const messageIds = await redis.zrange(`${conversationId}:messages`, 0, -1);

  if (messageIds.length === 0) return [];

  const pipeline = redis.pipeline();

  // get message hash
  messageIds.forEach((messageId) => pipeline.hgetall(messageId as string));

  const messages = (await pipeline.exec()) as Message[];

  return messages;
}
