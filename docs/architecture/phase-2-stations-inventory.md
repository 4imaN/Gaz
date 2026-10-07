# Phase 2: Stations, Pumps, Fuel Types, and Inventory

## Scope

Station managers configure stations and pumps; platform administrators approve stations.
Fuel inventory is an estimate maintained only through immutable inventory transactions.

## Inventory invariant

The `fuel_inventory.estimated_quantity_litres` balance is a denormalized operational
projection. Every change must also insert an `inventory_transactions` record in the same
database transaction. Direct update endpoints are prohibited.

