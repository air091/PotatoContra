import { Request, Response } from "express";
import prisma from "../lib/prisma";

class CourtController {
  static postCourt = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const { name } = request.body ?? {};

      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });
      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      let courtName = "";

      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0)
          return response.status(400).json({
            success: false,
            message: "Name must be a non-empty string",
          });

        courtName = name.trim();
      } else {
        const courtCount = await prisma.court.count({
          where: { sportId: sportId as string },
        });

        courtName = `court ${courtCount + 1}`;
      }

      const courtExist = await prisma.court.findFirst({
        where: {
          sportId: sportId as string,
          name: courtName,
        },
      });

      if (courtExist)
        return response.status(409).json({
          success: false,
          message: "Court already exists",
        });

      const court = await prisma.court.create({
        data: { name: courtName, sportId: sportId as string },
      });
      return response.status(201).json({ success: true, court });
    } catch (error: any) {
      console.error(`Post court failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Post court failed",
        error_message: error.message,
      });
    }
  };

  static getCourts = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;
      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });
      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const courts = await prisma.court.findMany({
        where: { sportId: sportId as string },
      });

      return response.status(200).json({ success: true, courts });
    } catch (error: any) {
      console.error(`Get courts failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get courts failed",
        error_message: error.message,
      });
    }
  };

  static deleteCourt = async (request: Request, response: Response) => {
    try {
      const { sportId, courtId } = request.params;
      const sportExist = await prisma.sport.findFirst({
        where: { id: sportId as string },
      });
      if (!sportExist)
        return response
          .status(404)
          .json({ success: false, message: "Sport not found" });

      const courtExist = await prisma.court.findFirst({
        where: { id: courtId as string, sportId: sportId as string },
      });
      if (!courtExist)
        return response
          .status(404)
          .json({ success: false, message: "Court not found" });

      await prisma.court.delete({
        where: { id: courtId as string },
      });

      return response.status(204).json({});
    } catch (error: any) {
      console.error(`Delete court failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Delete court failed",
        error_message: error.message,
      });
    }
  };
}

export default CourtController;
