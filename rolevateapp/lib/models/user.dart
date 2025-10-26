import 'package:rolevateapp/models/enums.dart';
import 'package:rolevateapp/models/company.dart';

/// User model representing both candidate and business users
class User {
  final String id;
  final UserType userType;
  final String? email;
  final String? name;
  final String? phone;
  final String? avatar;
  final bool isActive;
  final Company? company;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.userType,
    this.email,
    this.name,
    this.phone,
    this.avatar,
    required this.isActive,
    this.company,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create User from JSON
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? '',
      userType: json['userType'] != null 
          ? UserType.fromString(json['userType'] as String)
          : UserType.candidate,
      email: json['email'] as String?,
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      company: json['company'] != null
          ? Company.fromJson(json['company'] as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
    );
  }

  /// Convert User to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userType': userType.toJson(),
      'email': email,
      'name': name,
      'phone': phone,
      'avatar': avatar,
      'isActive': isActive,
      'company': company?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Copy with method for immutability
  User copyWith({
    String? id,
    UserType? userType,
    String? email,
    String? name,
    String? phone,
    String? avatar,
    bool? isActive,
    Company? company,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      userType: userType ?? this.userType,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      isActive: isActive ?? this.isActive,
      company: company ?? this.company,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  /// Get user initials for avatar
  String get initials {
    if (name == null || name!.isEmpty) return '?';
    final parts = name!.split(' ');
    if (parts.length == 1) {
      return parts[0][0].toUpperCase();
    }
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  /// Check if user is a business user
  bool get isBusiness => userType == UserType.business;

  /// Check if user is a candidate
  bool get isCandidate => userType == UserType.candidate;

  /// Check if user is an admin
  bool get isAdmin => userType == UserType.admin;

  @override
  String toString() {
    return 'User(id: $id, name: $name, userType: ${userType.name}, email: $email)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
