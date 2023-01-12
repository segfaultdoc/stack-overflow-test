use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod stack_overflow_test {
    use vote_state::lite::VoteStateLite;
    use vote_state::VoteState;
    use super::*;

    pub fn stack_overflow(ctx: Context<StackOverflow>) -> Result<()> {
        let _vote_state = VoteState::deserialize(&ctx.accounts.vote_state_account)?;
        Ok(())
    }

    pub fn stack_happy(ctx: Context<StackHappy>) -> Result<()> {
        let _vote_state = VoteStateLite::deserialize(&ctx.accounts.vote_state_account)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct StackOverflow<'info> {
    /// CHECK: Test code
    pub vote_state_account: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct StackHappy<'info> {
    /// CHECK: Test code
    pub vote_state_account: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
}
