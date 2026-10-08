// @ts-check

/**
 * @typedef {'restaurant'|'cafe'|'cloudKitchen'|'pharmacy'|'grocery'|'superShop'|'bakery'|'retail'|'electronics'|'cosmetics'} BusinessType
 * @typedef {'owner'|'admin'|'manager'|'cashier'|'inventoryManager'|'salesStaff'|'accountant'|'kitchenStaff'|'pharmacist'|'deliveryStaff'} RoleId
 * @typedef {'dashboard'|'pos'|'orders'|'products'|'inventory'|'suppliers'|'customers'|'staff'|'storefront'|'reports'|'settings'|'subscription'|'admin'} ViewId
 * @typedef {'pos'|'inventory'|'suppliers'|'customers'|'staff'|'reports'|'storefront'|'websiteBuilder'|'restaurantTables'|'restaurantKitchen'|'pharmacy'|'barcodeScale'|'crm'|'multiBranch'|'marketing'} ModuleId
 * @typedef {'loading'|'success'|'empty'|'error'} ResourceState
 * @typedef {'Cash'|'Card'|'bKash'|'Nagad'|'Rocket'|'Bangla QR'|'Bank transfer'|'Manual'|'Due'} PaymentMethod
 * @typedef {'Pending'|'Confirmed'|'Processing'|'Ready'|'Out for delivery'|'Completed'|'Cancelled'|'Refunded'|'Received'|'Preparing'|'Served'|'Prescription Required'|'Awaiting Pharmacist'|'Approved'|'Rejected'} OrderStatus
 *
 * @typedef {Object} ModuleDefinition
 * @property {ModuleId} id
 * @property {string} name
 * @property {number} monthlyPrice
 * @property {string} summary
 * @property {BusinessType[]} businessTypes
 * @property {string[]} permissions
 *
 * @typedef {Object} DashboardWidget
 * @property {string} id
 * @property {string} label
 * @property {ModuleId=} moduleId
 *
 * @typedef {Object} ProductAttributeDefinition
 * @property {string} key
 * @property {string} label
 * @property {'text'|'number'|'date'|'boolean'|'select'} type
 * @property {boolean=} sensitive
 *
 * @typedef {Object} BusinessTypeConfig
 * @property {BusinessType} id
 * @property {string} name
 * @property {string} shortName
 * @property {ModuleId[]} recommendedModules
 * @property {DashboardWidget[]} dashboardWidgets
 * @property {ProductAttributeDefinition[]} productAttributes
 * @property {OrderStatus[]} orderStatuses
 * @property {string} storefrontTheme
 * @property {string[]} setupTasks
 *
 * @typedef {Object} Branch
 * @property {string} id
 * @property {string} name
 * @property {string} address
 *
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {string} sku
 * @property {string} barcode
 * @property {string} category
 * @property {string} brand
 * @property {number} purchasePrice
 * @property {number} salePrice
 * @property {number=} discountPrice
 * @property {string} unit
 * @property {number} stock
 * @property {number} minimumStock
 * @property {boolean} featured
 * @property {boolean} active
 * @property {Record<string, string|number|boolean>} attributes
 *
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} tenantId
 * @property {string} branchId
 * @property {string} orderNo
 * @property {string} date
 * @property {string} source
 * @property {OrderStatus} status
 * @property {PaymentMethod} paymentMethod
 * @property {number} total
 * @property {'queued'|'synced'} syncStatus
 *
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {string} category
 * @property {string} phone
 * @property {number} payable
 * @property {number} lastPurchase
 *
 * @typedef {Object} StaffMember
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {RoleId} role
 * @property {string} shift
 * @property {number} salary
 * @property {'Present'|'Absent'|'On break'} status
 *
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {string} phone
 * @property {number} totalSpend
 * @property {number} due
 * @property {number} loyaltyPoints
 *
 * @typedef {Object} StorefrontSection
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {string} subtitle
 * @property {boolean} visible
 *
 * @typedef {Object} Tenant
 * @property {string} id
 * @property {string} name
 * @property {BusinessType} businessType
 * @property {string} phone
 * @property {string} email
 * @property {string} plan
 * @property {Branch[]} branches
 * @property {ModuleId[]} enabledModules
 * @property {{vatRate:number, serviceChargeRate:number, currency:string, language:string, receiptWidth:string, paymentMethods:PaymentMethod[]}} settings
 * @property {{slug:string, heroTitle:string, tagline:string, status:'draft'|'published', sections:StorefrontSection[]}} storefront
 *
 * @typedef {Object} AppState
 * @property {string} selectedTenantId
 * @property {ViewId} currentView
 * @property {Tenant[]} tenants
 * @property {Product[]} products
 * @property {Order[]} orders
 * @property {Supplier[]} suppliers
 * @property {StaffMember[]} staff
 * @property {Customer[]} customers
 * @property {{items:{productId:string, quantity:number}[], customerId:string|null, discount:number, notes:string}} cart
 * @property {{message:string, tone:'success'|'error'|'info'}|null} toast
 * @property {{open:boolean, query:string}} commandPalette
 */

export {};
