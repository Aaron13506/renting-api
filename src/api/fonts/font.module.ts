import { Module } from "@nestjs/common";
import { FontResolver } from "./font.resolver";
import { FontService } from "./font.service";


@Module({
  providers: [FontResolver, FontService ]
})
export class FontModule {}
