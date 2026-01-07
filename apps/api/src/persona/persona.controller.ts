import { Controller, Get, Param, Query, Patch, Body } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';

@Controller('personas')
export class PersonaController {
  constructor(private firestore: FirestoreService) { }

  @Get()
  async getAllPersonas(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.firestore.findMany('personas', (ref) => {
      let query: any = ref;
      if (category && category !== 'All') {
        query = query.where('category', '==', category);
      }
      return query.orderBy('createdAt', 'desc');
    });
  }

  @Get('featured')
  async getFeaturedPersonas() {
    return this.firestore.findMany('personas', (ref) => {
      return ref.where('isFeatured', '==', true).orderBy('createdAt', 'desc');
    });
  }

  @Get(':id')
  async getPersona(@Param('id') id: string) {
    return this.firestore.findUnique('personas', id);
  }

  @Patch(':id')
  async updatePersona(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      defaultCoinCost?: number;
      isFeatured?: boolean;
    },
  ) {
    return this.firestore.update('personas', id, data);
  }
}
