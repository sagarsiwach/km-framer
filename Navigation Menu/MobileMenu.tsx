// MobileMenu.tsx
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/designTokens-42aq.js"
import { NavItem } from "https://framer.com/m/NavItem-eXXk.js"
import { CloseIcon } from "https://framer.com/m/Icons-8dPD.js"

export function MobileMenu({
    isOpen,
    onClose,
    navItems,
    activeItem,
    onItemClick,
    activeSubmenu,
    showBackButton = true,
    ...props
}) {
    const handleCloseClick = (e) => {
        e.stopPropagation()
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100vh",
                        left: 0,
                        top: 0,
                        background: tokens.colors.neutral[200],
                        zIndex: 100,
                        overflowY: "auto",
                    }}
                    {...props}
                >
                    {/* Close Icon */}
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            position: "absolute",
                            top: 24,
                            right: 24,
                            cursor: "pointer",
                            zIndex: 10,
                        }}
                        onClick={handleCloseClick}
                    >
                        <CloseIcon
                            size={32}
                            color={tokens.colors.neutral[900]}
                        />
                    </div>

                    {/* Menu Content */}
                    <div
                        style={{
                            width: "90%",
                            maxWidth: 390,
                            margin: "0 auto",
                            paddingTop: activeSubmenu ? 80 : 398, // Positioned lower on main menu
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                        }}
                    >
                        {/* Title for submenu */}
                        {activeSubmenu && (
                            <div
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderBottom: `1px ${tokens.colors.neutral[300]} solid`,
                                    marginBottom: 20,
                                }}
                            >
                                <h2
                                    style={{
                                        color: tokens.colors.neutral[900],
                                        fontSize: "36px",
                                        fontFamily: "'Geist', sans-serif",
                                        fontWeight: 600,
                                        margin: 0,
                                    }}
                                >
                                    {activeSubmenu}
                                </h2>
                            </div>
                        )}

                        {/* Menu Items */}
                        {navItems.map((item, index) => (
                            <NavItem
                                key={index}
                                label={item.label}
                                isActive={activeItem === item.label}
                                variant={
                                    item.variant ||
                                    (activeSubmenu ? "mobileChild" : "mobile")
                                }
                                hasArrow={item.hasChildren}
                                onClick={() => onItemClick(item)}
                            />
                        ))}
                    </div>

                    {/* Back Button */}
                    {activeSubmenu && showBackButton && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: 40,
                                left: "50%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                alignItems: "center",
                                padding: 10,
                                background: tokens.colors.white,
                                borderRadius: 40,
                                outline: `1px ${tokens.colors.neutral[200]} solid`,
                                outlineOffset: "-1px",
                                gap: 10,
                                cursor: "pointer",
                            }}
                            onClick={onClose}
                        >
                            <div
                                style={{
                                    width: 20,
                                    height: 20,
                                    position: "relative",
                                    transform: "rotate(180deg)",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: 15,
                                        height: 12.5,
                                        left: 2.5,
                                        top: 3.75,
                                        position: "absolute",
                                        background: tokens.colors.neutral[700],
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    color: tokens.colors.neutral[700],
                                    fontSize: 20,
                                    fontFamily: "'Geist', sans-serif",
                                    fontWeight: 400,
                                }}
                            >
                                Back
                            </div>
                        </div>
                    )}

                    {/* Close Button for main menu */}
                    {!activeSubmenu && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: 40,
                                left: "50%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                alignItems: "center",
                                padding: 10,
                                background: tokens.colors.white,
                                borderRadius: 40,
                                outline: `1px ${tokens.colors.neutral[200]} solid`,
                                outlineOffset: "-1px",
                                gap: 10,
                                cursor: "pointer",
                            }}
                            onClick={onClose}
                        >
                            <div
                                style={{
                                    width: 20,
                                    height: 20,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: 11.67,
                                        height: 11.67,
                                        left: 4.17,
                                        top: 4.17,
                                        position: "absolute",
                                        background: tokens.colors.neutral[700],
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    color: tokens.colors.neutral[700],
                                    fontSize: 20,
                                    fontFamily: "'Geist', sans-serif",
                                    fontWeight: 400,
                                }}
                            >
                                Close
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Property Controls
addPropertyControls(MobileMenu, {
    isOpen: {
        type: ControlType.Boolean,
        title: "Is Open",
        defaultValue: false,
    },
    navItems: {
        type: ControlType.Array,
        title: "Navigation Items",
        control: {
            type: ControlType.Object,
            controls: {
                label: {
                    type: ControlType.String,
                    title: "Label",
                    defaultValue: "Menu Item",
                },
                hasChildren: {
                    type: ControlType.Boolean,
                    title: "Has Children",
                    defaultValue: false,
                },
                variant: {
                    type: ControlType.Enum,
                    title: "Variant",
                    options: ["mobile", "mobileChild", "mobileSubItem"],
                    defaultValue: "mobile",
                },
            },
        },
        defaultValue: [
            { label: "Motorbikes", hasChildren: true, variant: "mobile" },
            { label: "Scooters", hasChildren: true, variant: "mobile" },
            { label: "Micromobility", hasChildren: false, variant: "mobile" },
            { label: "Fleet", hasChildren: false, variant: "mobile" },
            { label: "Find a Dealer", hasChildren: false, variant: "mobile" },
            { label: "Contact Us", hasChildren: false, variant: "mobile" },
            { label: "More", hasChildren: true, variant: "mobile" },
        ],
    },
    activeItem: {
        type: ControlType.String,
        title: "Active Item",
        defaultValue: "",
    },
    activeSubmenu: {
        type: ControlType.String,
        title: "Active Submenu",
        defaultValue: "",
    },
    showBackButton: {
        type: ControlType.Boolean,
        title: "Show Back Button",
        defaultValue: true,
    },
})

export default MobileMenu
