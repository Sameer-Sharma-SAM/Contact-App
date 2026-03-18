import Contact from "../models/contacts.models.js"
import mongoose from "mongoose"

// ── VALIDATION HELPER ──
const validateContact = (data) => {
  const errors = {}

  // First Name
  if (!data.first_name || data.first_name.trim() === '') {
    errors.first_name = 'First name is required'
  } else if (data.first_name.trim().length < 2) {
    errors.first_name = 'First name must be at least 2 characters'
  } else if (!/^[a-zA-Z\s]+$/.test(data.first_name.trim())) {
    errors.first_name = 'First name can only contain letters'
  }

  // Last Name
  if (!data.last_name || data.last_name.trim() === '') {
    errors.last_name = 'Last name is required'
  } else if (data.last_name.trim().length < 2) {
    errors.last_name = 'Last name must be at least 2 characters'
  } else if (!/^[a-zA-Z\s]+$/.test(data.last_name.trim())) {
    errors.last_name = 'Last name can only contain letters'
  }

  // Email
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email address is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  // Phone
  if (!data.phone || data.phone.trim() === '') {
    errors.phone = 'Phone number is required'
  } else if (!/^[0-9+\-\s()]{7,15}$/.test(data.phone.trim())) {
    errors.phone = 'Enter a valid phone number (7-15 digits)'
  }

  // Address — optional but if provided must be 5+ chars
  if (data.address && data.address.trim().length > 0 && data.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters'
  }

  return errors
}

// ── GET ALL CONTACTS ──
export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 4 } = req.query
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    }
    const result = await Contact.paginate({}, options)
    res.render('home', {
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      currentPage: result.page,
      counter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      contacts: result.docs
    })
  } catch (error) {
    res.render('500', { message: error })
  }
}

// ── GET SINGLE CONTACT ──
export const getContact = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.render('404', { message: "Invalid Id" })
  }
  try {
    const contact = await Contact.findById(req.params.id)
    if (!contact) return res.render('404', { message: "Contact not found." })
    res.render('show-contact', { contact })
  } catch (error) {
    res.render('500', { message: error })
  }
}

// ── OPEN ADD CONTACT PAGE ──
export const addContactPage = (req, res) => {
  res.render('add-contact', { errors: {}, data: {} })
}

// ── SAVE ADD CONTACT ──
export const addContact = async (req, res) => {
  const errors = validateContact(req.body)

  // If errors — send back to form with errors + old data
  if (Object.keys(errors).length > 0) {
    return res.render('add-contact', {
      errors,
      data: req.body
    })
  }

  try {
    await Contact.create(req.body)
    res.redirect("/")
  } catch (error) {
    res.render('500', { message: error })
  }
}

// ── OPEN UPDATE CONTACT PAGE ──
export const updateContactPage = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.render('404', { message: "Invalid Id" })
  }
  try {
    const contact = await Contact.findById(req.params.id)
    if (!contact) return res.render('404', { message: "Contact not found." })
    res.render('update-contact', { contact, errors: {} })
  } catch (error) {
    res.render('500', { message: error })
  }
}

// ── SAVE UPDATE CONTACT ──
export const updateContact = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.render('404', { message: "Invalid Id" })
  }

  const errors = validateContact(req.body)

  // If errors — send back to form with errors + old data
  if (Object.keys(errors).length > 0) {
    return res.render('update-contact', {
      contact: { ...req.body, _id: req.params.id },
      errors
    })
  }

  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body)
    if (!contact) return res.render('404', { message: "Contact not found." })
    res.redirect("/")
  } catch (error) {
    res.render('500', { message: error })
  }
}

// ── DELETE CONTACT ──
export const deleteContact = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.render('404', { message: "Invalid Id" })
  }
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id)
    if (!contact) return res.render('404', { message: "Contact not found." })
    res.redirect("/")
  } catch (error) {
    res.render('500', { message: error })
  }
}