import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { StackOverflowTest } from "../target/types/stack_overflow_test";
import { assert } from "chai";
const { VoteProgram, VoteInit, sendAndConfirmTransaction, LAMPORTS_PER_SOL } =
  anchor.web3;

const provider = anchor.AnchorProvider.local("http://127.0.0.1:8899", {
  commitment: "confirmed",
  preflightCommitment: "confirmed",
});
anchor.setProvider(provider);
const program = anchor.workspace
  .StackOverflowTest as Program<StackOverflowTest>;

describe("stack-overflow-test", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  it("triggers stack overflow", async () => {
    const voteStateAccount = await setupVoteAccount();
    const payer = await fundAccount(100000000);

    try {
      await program.rpc.stackOverflow({
        accounts: {
          voteStateAccount: voteStateAccount.publicKey,
          payer: payer.publicKey,
        },
        signers: [payer],
      });
      console.log('no exception')
    } catch (e) {
      console.log("e: ", e);
    }
  });

  it("executes successfully", async () => {
    const voteStateAccount = await setupVoteAccount();
    const payer = await fundAccount(100000000);

    await program.rpc.stackHappy({
      accounts: {
        voteStateAccount: voteStateAccount.publicKey,
        payer: payer.publicKey,
      },
      signers: [payer],
    });
  });
});

const setupVoteAccount = async () => {
  // Create validator identity account.
  const validatorIdentityKeypair = await fundAccount(10000000000000);
  const validatorVoteAccount = anchor.web3.Keypair.generate();

  // Create validator's vote account.
  const voteInit = new VoteInit(
    validatorIdentityKeypair.publicKey,
    validatorIdentityKeypair.publicKey,
    validatorIdentityKeypair.publicKey,
    0
  );
  const lamports = await provider.connection.getMinimumBalanceForRentExemption(
    VoteProgram.space
  );
  const tx = VoteProgram.createAccount({
    fromPubkey: validatorIdentityKeypair.publicKey,
    votePubkey: validatorVoteAccount.publicKey,
    voteInit,
    lamports: lamports + 10 * LAMPORTS_PER_SOL,
  });
  try {
    await sendAndConfirmTransaction(provider.connection, tx, [
      validatorIdentityKeypair,
      validatorVoteAccount,
      validatorIdentityKeypair,
    ]);
  } catch (e) {
    console.log("error creating validator vote account", e);
    assert.fail(e);
  }

  return validatorVoteAccount;
};

const fundAccount = async (airdropAmount: number) => {
  const account = anchor.web3.Keypair.generate();
  if (airdropAmount) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        account.publicKey,
        airdropAmount
      ),
      "confirmed"
    );
  }

  return account;
};
