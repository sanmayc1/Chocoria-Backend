import Wallet from "../Model/walletModel.js";

const getWalletByUserId = async (req, res) => {
  try {
    const { id } = req.user;
    const wallet = await Wallet.findOne({ userId: id }).populate(
      "transactions"
    );
    if (!wallet) {
      const newWallet = new Wallet({
        userId: id,
        balance: 0,
        transactions: [],
      });
      const savedWallet = await newWallet.save();
      return res.status(200).json({ success: true, wallet: savedWallet });
    }
    res.status(200).json({ success: true, wallet });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export { getWalletByUserId };