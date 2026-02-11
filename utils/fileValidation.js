export const validateFile = (file) => {
  if (!file) return { valid: false, message: 'No file selected' };

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Only JPG, PNG, WEBP, PDF allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'File must be under 5MB'
    };
  }

  return { valid: true };
};
