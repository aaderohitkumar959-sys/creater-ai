import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private firestore: FirestoreService,
  ) { }

  /**
   * Verifies Firebase ID Token
   */
  async verifyFirebaseToken(token: string) {
    try {
      if (!admin.apps.length) admin.initializeApp();
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(firebaseUser: any) {
    const { uid, email, name, picture } = firebaseUser;

    // Sync user with Firestore
    const userRef = this.firestore.collection('users').doc(uid);
    const doc = await userRef.get();

    const userData = {
      id: uid,
      email: email || '',
      name: name || '',
      image: picture || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!doc.exists) {
      await userRef.set({
        ...userData,
        role: 'USER',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        coinBalance: 0,
      });
    } else {
      await userRef.update(userData);
    }

    return userData;
  }
}
