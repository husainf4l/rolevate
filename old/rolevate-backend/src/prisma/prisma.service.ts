import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    
    // Debug: Check if candidateProfile is available after connection
    console.log('=== PrismaService Debug After Connect ===');
    console.log('candidateProfile available:', !!this.candidateProfile);
    console.log('candidateProfile type:', typeof this.candidateProfile);
    console.log('user available:', !!this.user);
    console.log('user type:', typeof this.user);
    
    // List available models
    const props = Object.getOwnPropertyNames(this);
    const modelProps = props.filter(prop => 
      !prop.startsWith('$') && 
      !prop.startsWith('_') && 
      prop !== 'constructor'
    );
    console.log('Available models after connect:', modelProps);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
