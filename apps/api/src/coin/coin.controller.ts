import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { CoinService } from './coin.service';

@Controller('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get('balance/:userId')
  async getBalance(@Param('userId') userId: string) {
    const balance = await this.coinService.getBalance(userId);
    return { balance };
  }

  @Get('transactions/:userId')
  async getTransactions(@Param('userId') userId: string) {
    return this.coinService.getTransactionHistory(userId);
  }

  @Post('spend')
  async spendCoins(
    @Body() body: { userId: string; amount: number; description: string },
  ) {
    return this.coinService.deductCoins(
      body.userId,
      body.amount,
      body.description,
    );
  }
}
