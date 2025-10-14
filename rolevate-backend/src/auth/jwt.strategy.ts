
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { CandidateService } from '../candidate/candidate.service';

// Validate JWT secret is provided
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required but not provided');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly candidateService: CandidateService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.access_token;
          return token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to Bearer token
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret!,
    });
    // JWT Strategy initialized
  }

  async validate(payload: any) {
    // Validating JWT payload

    // Fetch user details
    let userName: string | undefined = undefined;
    let candidateProfileId: string | undefined = undefined;
    let companyId: string | undefined = undefined;
    
    try {
      const user = await this.userService.findById(payload.sub);
      if (user) {
        userName = user.name || undefined;
        companyId = user.companyId || undefined;
      }
    } catch {
      // Error fetching user
    }
    
    if (payload.userType === 'CANDIDATE') {
      try {
        const profile = await this.candidateService.findProfileByUserId(payload.sub);
        if (profile) {
          candidateProfileId = profile.id;
        }
      } catch {
        // Error fetching candidate profile
      }
    }

    const result = {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      name: userName,
      userType: payload.userType,
      candidateProfileId,
      companyId,
    };
    // JWT validation completed
    return result;
  }
}
