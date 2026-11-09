import { Router } from "express";
import { getWalletByUserId } from "../services/walletService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const wallet = await getWalletByUserId(userId);

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found.",
      });
    }

    return res.status(200).json({
      wallet,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
