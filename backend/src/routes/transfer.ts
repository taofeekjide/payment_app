import { Router } from "express";
import { transferFunds, TransferError } from "../services/transferService.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const senderUserId = req.session.userId;

    if (!senderUserId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const { recipientEmail, amountKobo } = req.body ?? {};
    const idempotencyKey = req.get("Idempotency-Key");

    if (
      typeof recipientEmail !== "string" ||
      typeof amountKobo !== "string" ||
      typeof idempotencyKey !== "string"
    ) {
      return res.status(400).json({
        message: "Recipient email, amount, and request key are required.",
      });
    }

    const result = await transferFunds({
      senderUserId,
      recipientEmail,
      amountKobo,
      idempotencyKey,
    });

    return res.status(result.reused ? 200 : 201).json({
      message: result.reused
        ? "Transfer was already processed."
        : "Transfer successful.",
      transfer: result,
    });
  } catch (error) {
    if (error instanceof TransferError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    next(error);
  }
});

export default router;
