import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import * as admin from 'firebase-admin';

@Injectable()
export class CreatorService {
  constructor(
    private firestore: FirestoreService,
    private config: ConfigService,
  ) { }

  private async encrypt(text: string): Promise<string> {
    const password = this.config.get<string>('ENCRYPTION_KEY') || 'default-secret-key';
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encryptedText.toString('hex');
  }

  async createCreatorProfile(userId: string, bio: string) {
    return this.firestore.create('creators', { bio, userId, earnings: 0 }, userId);
  }

  async createPersona(creatorId: string, data: { name: string; description: string; avatarUrl?: string; personality: any }) {
    return this.firestore.create('personas', { creatorId, ...data, trainingData: [] });
  }

  async addTrainingData(personaId: string, content: string, type: 'TEXT' | 'FILE' = 'TEXT') {
    const encryptedContent = await this.encrypt(content);
    const persona = await this.firestore.findUnique('personas', personaId) as any;
    if (!persona) throw new Error('Persona not found');

    const trainingData = persona.trainingData || [];
    trainingData.push({ content: encryptedContent, type, createdAt: new Date() });

    return this.firestore.update('personas', personaId, { trainingData });
  }

  async getCreatorProfile(userId: string) {
    const creator = await this.firestore.findUnique('creators', userId) as any;
    if (!creator) return null;
    const personas = await this.firestore.findMany('personas', (ref) => ref.where('creatorId', '==', creator.id));
    return { ...creator, personas };
  }

  async getPersonaById(personaId: string) {
    const persona = await this.firestore.findUnique('personas', personaId) as any;
    if (!persona) return null;
    const creator = await this.firestore.findUnique('creators', persona.creatorId);
    return { ...persona, creator };
  }

  async updatePersona(personaId: string, data: any) {
    return this.firestore.update('personas', personaId, data);
  }

  async getDashboardStats(userId: string) {
    const creator = await this.firestore.findUnique('creators', userId) as any;
    if (!creator) return null;

    const personas = await this.firestore.findMany('personas', (ref) => ref.where('creatorId', '==', creator.id)) as any[];

    const personasWithStats = await Promise.all(personas.map(async (p) => {
      const conversationsCount = await this.firestore.count('conversations', (ref) => ref.where('personaId', '==', p.id));
      return { ...p, conversationCount: conversationsCount };
    }));

    return {
      earnings: creator.earnings || 0,
      personas: personasWithStats,
      totalPersonas: personas.length,
    };
  }
}
