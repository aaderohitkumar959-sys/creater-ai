import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class CreatorService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private async encrypt(text: string): Promise<string> {
    const password =
      this.config.get<string>('ENCRYPTION_KEY') || 'default-secret-key';
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encryptedText.toString('hex');
  }

  async createCreatorProfile(userId: string, bio: string) {
    return this.prisma.creator.create({
      data: {
        userId,
        bio,
      },
    });
  }

  async createPersona(
    creatorId: string,
    data: {
      name: string;
      description: string;
      avatarUrl?: string;
      personality: any;
    },
  ) {
    return this.prisma.persona.create({
      data: {
        creatorId,
        ...data,
      },
    });
  }

  async addTrainingData(
    personaId: string,
    content: string,
    type: 'TEXT' | 'FILE' = 'TEXT',
  ) {
    const encryptedContent = await this.encrypt(content);
    return this.prisma.trainingData.create({
      data: {
        personaId,
        content: encryptedContent,
        type,
      },
    });
  }

  async getCreatorProfile(userId: string) {
    return this.prisma.creator.findUnique({
      where: { userId },
      include: { personas: true },
    });
  }

  async getPersonaById(personaId: string) {
    return this.prisma.persona.findUnique({
      where: { id: personaId },
      include: {
        trainingData: true,
        creator: true,
      },
    });
  }

  async updatePersona(
    personaId: string,
    data: {
      name?: string;
      description?: string;
      avatarUrl?: string;
      personality?: any;
    },
  ) {
    return this.prisma.persona.update({
      where: { id: personaId },
      data,
    });
  }

  async getDashboardStats(userId: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { userId },
      include: {
        personas: {
          include: {
            _count: {
              select: { conversations: true },
            },
          },
        },
      },
    });

    if (!creator) return null;

    // Calculate total messages across all personas
    // Note: This is an approximation or requires a more complex query if we want exact message counts
    // For now, let's just return the personas and total earnings

    return {
      earnings: creator.earnings,
      personas: creator.personas.map((p) => ({
        ...p,
        conversationCount: p._count.conversations,
      })),
      totalPersonas: creator.personas.length,
    };
  }
}
