
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { CandidateService } from '../candidate/candidate.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly candidateService: CandidateService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          console.log('=== JWT Extractor called ===');
          console.log('Request cookies:', request?.cookies);
          console.log('access_token from cookies:', request?.cookies?.access_token);
          const token = request?.cookies?.access_token;
          console.log('Extracted token from cookies:', token ? 'Token found' : 'No token');
          
          if (token) {
            try {
              // Decode JWT payload without verification to check expiration
              const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
              const now = Math.floor(Date.now() / 1000);
              console.log('JWT payload:', payload);
              console.log('Current time (epoch):', now);
              console.log('Token expires at (epoch):', payload.exp);
              console.log('Token expired?', now > payload.exp);
              console.log('Time until expiration (seconds):', payload.exp - now);
              
              if (now > payload.exp) {
                console.log('❌ Token is EXPIRED - this will cause 401');
              } else {
                console.log('✅ Token is still valid');
              }
            } catch (error) {
              console.log('Error decoding JWT payload:', error);
            }
          }
          
          return token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to Bearer token
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret',
    });
    console.log('JWT Strategy initialized with secret:', process.env.JWT_SECRET ? 'Secret found' : 'Using default secret');
  }

  async validate(payload: any) {
    console.log('=== JWT Strategy validate called ===');
    console.log('JWT payload:', payload);

    // Fetch user and candidate profile if userType is CANDIDATE
    let candidateProfileId: string | undefined = undefined;
    if (payload.userType === 'CANDIDATE') {
      try {
        const profile = await this.candidateService.findProfileByUserId(payload.sub);
        if (profile) {
          candidateProfileId = profile.id;
        }
      } catch (e) {
        console.log('Error fetching candidate profile in JWT strategy:', e);
      }
    }

    const result = {
      userId: payload.sub,
      email: payload.email,
      userType: payload.userType,
      candidateProfileId,
    };
    console.log('JWT validation result:', result);
    return result;
  }
}
