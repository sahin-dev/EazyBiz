import { SetMetadata } from "@nestjs/common";

export const ALLOW_PLATFORM_KEY = "allowPlatform";
export const AllowPlatform = () => SetMetadata(ALLOW_PLATFORM_KEY, true);
