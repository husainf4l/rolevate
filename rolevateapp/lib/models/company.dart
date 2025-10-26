/// Company model
class Company {
  final String id;
  final String name;
  final String? description;
  final String? website;
  final String? email;
  final String? phone;
  final String? logo;
  final String? industry;
  final String? size;
  final DateTime? founded;
  final String? location;
  final String? addressId;
  final DateTime createdAt;
  final DateTime updatedAt;

  Company({
    required this.id,
    required this.name,
    this.description,
    this.website,
    this.email,
    this.phone,
    this.logo,
    this.industry,
    this.size,
    this.founded,
    this.location,
    this.addressId,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create Company from JSON
  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Unknown Company',
      description: json['description'] as String?,
      website: json['website'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      logo: json['logo'] as String?,
      industry: json['industry'] as String?,
      size: json['size'] as String?,
      founded: json['founded'] != null
          ? DateTime.parse(json['founded'] as String)
          : null,
      location: json['location'] as String?,
      addressId: json['addressId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
    );
  }

  /// Convert Company to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'website': website,
      'email': email,
      'phone': phone,
      'logo': logo,
      'industry': industry,
      'size': size,
      'founded': founded?.toIso8601String(),
      'location': location,
      'addressId': addressId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Copy with method for immutability
  Company copyWith({
    String? id,
    String? name,
    String? description,
    String? website,
    String? email,
    String? phone,
    String? logo,
    String? industry,
    String? size,
    DateTime? founded,
    String? location,
    String? addressId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Company(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      website: website ?? this.website,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      logo: logo ?? this.logo,
      industry: industry ?? this.industry,
      size: size ?? this.size,
      founded: founded ?? this.founded,
      location: location ?? this.location,
      addressId: addressId ?? this.addressId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'Company(id: $id, name: $name, location: $location)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Company && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
