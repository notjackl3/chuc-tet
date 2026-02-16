-- Migration: Rename root node from "Me" to "Ti"
UPDATE members SET name = 'Ti' WHERE name = 'Me';
