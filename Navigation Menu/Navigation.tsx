// Navigation.tsx
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/designTokens-42aq.js"
import NavBar from "https://framer.com/m/NavBar-dCvV.js"
import MobileMenu from "https://framer.com/m/MobileMenu-whVk.js"
import DesktopDropdown from "https://framer.com/m/DesktopDropdown-B7VD.js"
import NavItem from "https://framer.com/m/NavItem-eXXk.js"

// Main Navigation component
function Navigation({
    logoColor = "#404040",
    activeItem = "",
    showDropdowns = true,
    ...props
}) {
    // State
    const [isMobile, setIsMobile] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeSubmenu, setActiveSubmenu] = useState("")
    const [submenuItems, setSubmenuItems] = useState([])
    const [activeDropdown, setActiveDropdown] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const navigationRef = useRef(null)

    // Default navigation items
    const mainNavItems = [
        { label: "Motorbikes", hasDropdown: true },
        { label: "Scooters", hasDropdown: true },
        { label: "Micromobility", hasDropdown: false },
        { label: "Fleet", hasDropdown: false },
        { label: "Dealers", hasDropdown: false },
        { label: "Contact", hasDropdown: false },
        { label: "More", hasDropdown: true },
    ]

    // Mobile navigation items
    const mobileNavItems = [
        { label: "Motorbikes", hasChildren: true, variant: "mobile" },
        { label: "Scooters", hasChildren: true, variant: "mobile" },
        { label: "Micromobility", hasChildren: false, variant: "mobile" },
        { label: "Fleet", hasChildren: false, variant: "mobile" },
        { label: "Find a Dealer", hasChildren: false, variant: "mobile" },
        { label: "Contact Us", hasChildren: false, variant: "mobile" },
        { label: "More", hasChildren: true, variant: "mobile" },
    ]

    // Dropdown contents
    const motorbikesDropdown = [
        {
            label: "KM5000",
            type: "model",
            image: "https://placehold.co/370x208",
            url: "#",
        },
        {
            label: "KM4000",
            type: "model",
            image: "https://placehold.co/370x208",
            url: "#",
        },
        {
            label: "KM3000",
            type: "model",
            image: "https://placehold.co/370x208",
            url: "#",
        },
        { label: "Test Rides", type: "link", url: "#" },
        { label: "Book Now", type: "link", url: "#" },
        { label: "Locate a Store", type: "link", url: "#" },
        { label: "Compare Models", type: "link", url: "#" },
    ]

    const scootersDropdown = [
        {
            label: "KS3000",
            type: "model",
            image: "https://placehold.co/370x208",
            url: "#",
        },
        {
            label: "KS2000",
            type: "model",
            image: "https://placehold.co/370x208",
            url: "#",
        },
        {
            label: "KS1000",
            type: "model",
            image: "https://placehold.co/370x208",
            url: "#",
        },
        { label: "Test Rides", type: "link", url: "#" },
        { label: "Book Now", type: "link", url: "#" },
        { label: "Locate a Store", type: "link", url: "#" },
        { label: "Compare Models", type: "link", url: "#" },
    ]

    const moreDropdown = [
        { label: "About Us", type: "link", group: 0, url: "#" },
        { label: "Press", type: "link", group: 0, url: "#" },
        { label: "Blog", type: "link", group: 0, url: "#" },
        { label: "Become a Dealer", type: "link", group: 0, url: "#" },
        { label: "Support", type: "link", group: 1, url: "#" },
        { label: "Contact Us", type: "link", group: 1, url: "#" },
        { label: "FAQ", type: "link", group: 1, url: "#" },
        { label: "Compare Models", type: "link", group: 1, url: "#" },
    ]

    // Mobile submenu items
    const motorbikesSubmenu = [
        { label: "KM5000", hasChildren: false, variant: "mobileChild" },
        { label: "KM4000", hasChildren: false, variant: "mobileChild" },
        { label: "KM3000", hasChildren: false, variant: "mobileChild" },
        { label: "Test Rides", hasChildren: false, variant: "mobileSubItem" },
        { label: "Book Now", hasChildren: false, variant: "mobileSubItem" },
        {
            label: "Locate a Store",
            hasChildren: false,
            variant: "mobileSubItem",
        },
    ]

    const scootersSubmenu = [
        { label: "KS3000", hasChildren: false, variant: "mobileChild" },
        { label: "KS2000", hasChildren: false, variant: "mobileChild" },
        { label: "KS1000", hasChildren: false, variant: "mobileChild" },
        { label: "Test Rides", hasChildren: false, variant: "mobileSubItem" },
        { label: "Book Now", hasChildren: false, variant: "mobileSubItem" },
        {
            label: "Locate a Store",
            hasChildren: false,
            variant: "mobileSubItem",
        },
    ]

    const moreSubmenu = [
        { label: "About Us", hasChildren: false, variant: "mobileChild" },
        { label: "Press", hasChildren: false, variant: "mobileChild" },
        { label: "Blog", hasChildren: false, variant: "mobileChild" },
        {
            label: "Become a Dealer",
            hasChildren: false,
            variant: "mobileChild",
        },
        { label: "Support", hasChildren: false, variant: "mobileChild" },
        { label: "Contact Us", hasChildren: false, variant: "mobileChild" },
        { label: "FAQ", hasChildren: false, variant: "mobileChild" },
    ]

    // Check if we're on mobile
    useEffect(() => {
        if (typeof window !== "undefined") {
            const checkIsMobile = () => {
                setIsMobile(window.innerWidth < 1024)
                if (window.innerWidth >= 1024) {
                    setMobileMenuOpen(false)
                }
            }

            checkIsMobile()
            window.addEventListener("resize", checkIsMobile)

            return () => {
                window.removeEventListener("resize", checkIsMobile)
            }
        }
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                navigationRef.current &&
                !navigationRef.current.contains(event.target)
            ) {
                setActiveDropdown("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Handle item hover for desktop dropdown
    const handleItemHover = (item) => {
        if (!showDropdowns) return

        if (item === "Motorbikes" || item === "Scooters" || item === "More") {
            setIsHovering(true)
            setActiveDropdown(item.toLowerCase())
        } else {
            setActiveDropdown("")
        }
    }

    // Handle mouse leave for desktop dropdown
    const handleMouseLeave = () => {
        setIsHovering(false)

        // Add a small delay before closing to allow movement between navbar and dropdown
        setTimeout(() => {
            if (!isHovering) {
                setActiveDropdown("")
            }
        }, 100)
    }

    // Handle click on desktop nav item
    const handleItemClick = (item) => {
        if (isMobile) return

        if (activeItem === item.label) {
            // Toggle dropdown if clicking on active item
            setActiveDropdown(activeDropdown ? "" : item.label.toLowerCase())
        } else {
            // Navigate to page or open dropdown
            if (item.hasDropdown && showDropdowns) {
                setActiveDropdown(item.label.toLowerCase())
            } else {
                setActiveDropdown("")
                // Navigate logic would go here (outside the scope of this component)
                console.log(`Navigate to ${item.label}`)
            }
        }
    }

    // Handle mobile menu toggle
    const handleMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen)
        setActiveSubmenu("")
        setSubmenuItems([])
    }

    // Handle mobile menu item click
    const handleMobileItemClick = (item) => {
        if (item.hasChildren) {
            // Set the submenu based on item clicked
            setActiveSubmenu(item.label)

            // Set submenu items
            switch (item.label) {
                case "Motorbikes":
                    setSubmenuItems(motorbikesSubmenu)
                    break
                case "Scooters":
                    setSubmenuItems(scootersSubmenu)
                    break
                case "More":
                    setSubmenuItems(moreSubmenu)
                    break
                default:
                    setSubmenuItems([])
            }
        } else {
            // Handle click on regular mobile item
            setMobileMenuOpen(false)
            // Navigate logic would go here
            console.log(`Navigate to ${item.label}`)
        }
    }

    // Handle back button in mobile submenu
    const handleBackToMainMenu = () => {
        setActiveSubmenu("")
        setSubmenuItems([])
    }

    return (
        <div
            ref={navigationRef}
            style={{
                width: "100%",
                position: "relative",
                zIndex: 100,
            }}
            {...props}
        >
            {/* NavBar Component */}
            <NavBar
                logoColor={logoColor}
                isMobile={isMobile}
                navItems={mainNavItems}
                activeItem={activeItem}
                onMenuToggle={handleMenuToggle}
                onItemHover={handleItemHover}
                onItemClick={handleItemClick}
            />

            {/* Desktop Dropdowns */}
            {!isMobile && showDropdowns && (
                <>
                    <div
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <DesktopDropdown
                            isOpen={activeDropdown === "motorbikes"}
                            type="motorbikes"
                            items={motorbikesDropdown}
                            onItemClick={(item) =>
                                console.log(`Clicked ${item.label}`)
                            }
                        />

                        <DesktopDropdown
                            isOpen={activeDropdown === "scooters"}
                            type="scooters"
                            items={scootersDropdown}
                            onItemClick={(item) =>
                                console.log(`Clicked ${item.label}`)
                            }
                        />

                        <DesktopDropdown
                            isOpen={activeDropdown === "more"}
                            type="more"
                            items={moreDropdown}
                            onItemClick={(item) =>
                                console.log(`Clicked ${item.label}`)
                            }
                        />
                    </div>
                </>
            )}

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={
                    activeSubmenu ? handleBackToMainMenu : handleMenuToggle
                }
                navItems={activeSubmenu ? submenuItems : mobileNavItems}
                activeItem={activeItem}
                activeSubmenu={activeSubmenu}
                onItemClick={handleMobileItemClick}
                showBackButton={activeSubmenu ? true : false}
            />
        </div>
    )
}

// Property Controls
addPropertyControls(Navigation, {
    logoColor: {
        type: ControlType.Color,
        title: "Logo Color",
        defaultValue: "#404040",
    },
    activeItem: {
        type: ControlType.Enum,
        title: "Active Item",
        options: [
            "",
            "Motorbikes",
            "Scooters",
            "Micromobility",
            "Fleet",
            "Dealers",
            "Contact",
            "More",
        ],
        defaultValue: "",
    },
    showDropdowns: {
        type: ControlType.Boolean,
        title: "Show Dropdowns",
        defaultValue: true,
    },
})

export default Navigation
