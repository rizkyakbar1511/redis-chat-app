import PusherServer from "pusher";
import PusherClient from "pusher-js";

/**
 * in development mode this will create multiple instance
 * that can cause hit the connection to the limit in free tier
 * */
// export const pusherServer = new PusherServer({
//     appId: process.env.PUSHER_APP_ID!,
//     key: process.env.PUSHER_APP_KEY!,
//     secret: process.env.PUSHER_APP_SECRET!,
//     cluster: process.env.PUSHER_APP_CLUSTER!,
//     useTLS: true,
// });

// export const pusherClient = new PusherClient(process.env.PUSHER_APP_KEY!, {
//     cluster: "ap1",
// });

declare global {
  var pusherServer: PusherServer | undefined;
  var pusherClient: PusherClient | undefined;
}

/**
 * this would fix the multiple instance creation issue
 */
export const pusherServer =
  global.pusherServer ||
  new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_APP_KEY!,
    secret: process.env.PUSHER_APP_SECRET!,
    cluster: process.env.PUSHER_APP_CLUSTER!,
    useTLS: true,
  });

export const pusherClient =
  global.pusherClient ||
  new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: "ap1",
  });
