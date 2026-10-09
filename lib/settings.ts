import { cache } from "react";
import { prisma } from "./db";

export const getSettings = cache(async () => {
  let settings = await prisma.setting.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.setting.create({ data: { id: 1 } });
  }
  return settings;
});
