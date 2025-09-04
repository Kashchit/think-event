import { body, validationResult } from 'express-validator';

// Common validation rules
export const commonValidations = {
  username: body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters, alphanumeric and underscores only'),
  
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with lowercase, uppercase, and number'),
  
  firstName: body('first_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be 2-100 characters'),
  
  lastName: body('last_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be 2-100 characters'),
  
  phone: body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      // Remove all non-digit characters
      const cleaned = value.replace(/\D/g, '');
      
      // Indian numbers: +91XXXXXXXXXX (12 digits total)
      if (value.startsWith('+91') && cleaned.length === 12) {
        return true;
      }
      
      // Nepalese numbers: +977XXXXXXXXX (12 digits total)
      if (value.startsWith('+977') && cleaned.length === 12) {
        return true;
      }
      
      // 10-digit numbers (assume Indian)
      if (cleaned.length === 10) {
        return true;
      }
      
      throw new Error('Please provide a valid Indian (+91) or Nepalese (+977) phone number');
    })
    .withMessage('Please provide a valid phone number'),
  
  eventTitle: body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Event title must be 5-255 characters'),
  
  eventDescription: body('description')
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage('Event description must be 3-2000 characters'),
  
  eventPrice: body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  eventSeats: body('total_seats')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total seats must be a positive integer'),
  
  eventDate: body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  eventTime: body('start_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/)
    .withMessage('Start time must be in HH:MM or HH:MM:SS format'),
  
  venueName: body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Venue name must be 3-255 characters'),
  
  venueAddress: body('address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Venue address must be 10-500 characters'),
  
  venueCity: body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be 2-100 characters'),
  
  venueCountry: body('country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be 2-100 characters'),
  
  categoryName: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be 2-100 characters'),
  
  categoryDescription: body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Category description must be less than 500 characters'),
  
  categoryColor: body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code'),
  
  bookingQuantity: body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  bookingSeats: body('seat_numbers')
    .isArray({ min: 1 })
    .withMessage('At least one seat must be selected'),
  
  reviewRating: body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  reviewComment: body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comment must be less than 1000 characters')
};

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Custom validation functions
export const validateEventDates = (req, res, next) => {
  const { start_date, end_date, start_time, end_time } = req.body;
  
  const startDateTime = new Date(`${start_date}T${start_time}`);
  const endDateTime = new Date(`${end_date}T${end_time || start_time}`);
  
  if (startDateTime <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Event start date must be in the future'
    });
  }
  
  if (endDateTime <= startDateTime) {
    return res.status(400).json({
      success: false,
      message: 'Event end date must be after start date'
    });
  }
  
  next();
};

export const validateSeatAvailability = async (req, res, next) => {
  try {
    const { event_id, seat_numbers } = req.body;
    
    // Check if seats are available
    const seatResult = await query(
      'SELECT available_seats FROM events WHERE id = $1',
      [event_id]
    );
    
    if (seatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const availableSeats = seatResult.rows[0].available_seats;
    
    if (seat_numbers.length > availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableSeats} seats available`
      });
    }
    
    next();
  } catch (error) {
    console.error('Seat validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
