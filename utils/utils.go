package utils

import (
	"errors"
	"regexp"
)

func ValidateInputs(username, email, password, firstName, lastName string, age int) error {
	if len(username) < 4 {
		return errors.New("username must be at least 4 characters")
	}
	
	if !regexp.MustCompile(`^[a-zA-Z0-9_]+$`).MatchString(username) {
		return errors.New("username can only contain letters, numbers and underscores")
	}

	if !regexp.MustCompile(`^[^@]+@[^@]+\.[^@]+$`).MatchString(email) {
		return errors.New("invalid email format")
	}

	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	if len(firstName) < 2 {
		return errors.New("first name must be at least 2 characters")
	}

	if len(lastName) < 2 {
		return errors.New("last name must be at least 2 characters")
	}

	if age < 13 {
		return errors.New("you must be at least 13 years old")
	}

	return nil
}
