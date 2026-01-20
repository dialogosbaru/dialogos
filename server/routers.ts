import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { chatRouter } from "./routers/chat.js";
import { conversationsRouter } from "./routers/conversations.js";
import { onboardingRouter } from "./routers/onboarding.js";
import { ttsRouter } from "./routers/tts.js";
import { userRouter } from "./routers/user.js";
import { reminderRouter } from "./routers/reminderRouter.js";
import { analyticsRouter } from "./routers/analytics.js";
import { gamificationRouter } from "./routers/gamification.js";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  chat: chatRouter,
  conversations: conversationsRouter,
  onboarding: onboardingRouter,
  tts: ttsRouter,
  user: userRouter,
  reminders: reminderRouter,
  analytics: analyticsRouter,
  gamification: gamificationRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
