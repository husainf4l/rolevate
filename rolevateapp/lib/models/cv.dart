/// CV/Resume model
class CV {
  final String id;
  final String fileName;
  final String fileUrl;
  final double fileSize;
  final String mimeType;
  final bool isPrimary;
  final DateTime uploadedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  CV({
    required this.id,
    required this.fileName,
    required this.fileUrl,
    required this.fileSize,
    required this.mimeType,
    required this.isPrimary,
    required this.uploadedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create CV from JSON
  factory CV.fromJson(Map<String, dynamic> json) {
    return CV(
      id: json['id'] as String,
      fileName: json['fileName'] as String,
      fileUrl: json['fileUrl'] as String,
      fileSize: (json['fileSize'] as num).toDouble(),
      mimeType: json['mimeType'] as String,
      isPrimary: json['isPrimary'] as bool,
      uploadedAt: DateTime.parse(json['uploadedAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// Convert CV to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fileName': fileName,
      'fileUrl': fileUrl,
      'fileSize': fileSize,
      'mimeType': mimeType,
      'isPrimary': isPrimary,
      'uploadedAt': uploadedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Get formatted file size
  String get formattedFileSize {
    if (fileSize < 1024) return '${fileSize.toStringAsFixed(0)} B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  /// Check if file is PDF
  bool get isPdf => mimeType.toLowerCase().contains('pdf');

  /// Check if file is Word document
  bool get isWord =>
      mimeType.toLowerCase().contains('word') ||
      mimeType.toLowerCase().contains('msword') ||
      fileName.toLowerCase().endsWith('.doc') ||
      fileName.toLowerCase().endsWith('.docx');

  /// Get file extension
  String get extension {
    if (fileName.contains('.')) {
      return fileName.split('.').last.toLowerCase();
    }
    return '';
  }

  @override
  String toString() => 'CV($fileName, ${formattedFileSize})';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is CV && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
