import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const username = formData.get("username")?.toString();
        const avatarFile = formData.get("avatar") as File | null;
        const bannerFile = formData.get("banner") as File | null;

        if (!username) {
            return NextResponse.json({ message: "Username is required" }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public", "img");
        await fs.mkdir(uploadDir, { recursive: true });

        const result: any = {};

        if (avatarFile) {
            const timestamp = Date.now();
            const avatarFileName = `avatar-${username}-${timestamp}.${avatarFile.name.split('.').pop()}`;
            const avatarPath = path.join(uploadDir, avatarFileName);
            await fs.writeFile(avatarPath, Buffer.from(await avatarFile.arrayBuffer()));
            result.avatarPath = avatarFileName;
        }

        if (bannerFile) {
            const timestamp = Date.now();
            const bannerFileName = `banner-${username}-${timestamp}.${bannerFile.name.split('.').pop()}`;
            const bannerPath = path.join(uploadDir, bannerFileName);
            await fs.writeFile(bannerPath, Buffer.from(await bannerFile.arrayBuffer()));
            result.bannerPath = bannerFileName;
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Failed to upload files" }, { status: 500 });
    }
}