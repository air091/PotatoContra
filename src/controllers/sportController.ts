import { Request, Response } from "express";
import prisma from "../lib/prisma";

class SportController {
  static postSport = async (request: Request, response: Response) => {
    try {
      const { name } = request.body;

      const sportName = name.trim();
      if (sportName.length === 0)
        return response
          .status(400)
          .json({ success: false, message: "Name is required" });

      const isExist = await prisma.sport.findFirst({
        where: { name: sportName },
      });

      if (isExist)
        return response
          .status(409)
          .json({ success: false, message: "Sport already exist" });

      const sport = await prisma.sport.create({ data: { name } });
      return response.status(201).json({ success: true, sport });
    } catch (error: any) {
      console.error(`Post sport failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Post sport failed",
        error_message: error.message,
      });
    }
  };

  static getSports = async (request: Request, response: Response) => {
    try {
      const sports = await prisma.sport.findMany();
      if (sports.length === 0)
        return response
          .status(404)
          .json({ success: false, message: "No sports" });

      return response.status(200).json({ success: true, sports });
    } catch (error: any) {
      console.error(`Get sports failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Get sports failed",
        error_message: error.message,
      });
    }
  };

  static deleteSport = async (request: Request, response: Response) => {
    try {
      const { sportId } = request.params;

      const sport = await prisma.sport.findUnique({
        where: { id: sportId as string },
      });

      if (!sport)
        return response
          .status(404)
          .json({ success: false, message: "No sport found" });

      await prisma.sport.delete({
        where: { id: sportId as string },
      });

      return response.status(204).json({});
    } catch (error: any) {
      console.error(`Delete sport failed ${error}`);
      return response.status(500).json({
        success: false,
        message: "Delete sport failed",
        error_message: error.message,
      });
    }
  };
}

export default SportController;
