import { Request, Response } from "express";

class TeamController {
  static postTeamPlayer = async (request: Request, response: Response) => {
    try {
    } catch (error: any) {
      console.error(`Post team player ${error}`);
      return response
        .status(500)
        .json({
          success: false,
          message: "Post team player",
          error_message: error.message,
        });
    }
  };
}

export default TeamController;
