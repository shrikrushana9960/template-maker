import React, { useState, ChangeEvent } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Drawer,
    CssBaseline,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    Tooltip,
    Tabs,
    Tab,
    Grid,
    Paper,
} from "@mui/material";
import {
    ArrowBack,
    ArrowForward,
    Add,
    InsertDriveFile,
    Save,
    PictureAsPdf,
    TextFields,
    Image,
    TableChart,
    BarChart,
    ShowChart,
} from "@mui/icons-material";

const leftWidth = 200;
const rightWidth = 280;

interface LayoutSelectorProps {
    onSelect: (layout: string) => void;
}

const layouts = [
    { // A, B, C stacked vertically
        layout: '{"cells": [["A"], ["B"], ["C"]]}',
        svg: (
            <>
                <rect x="0" y="0" width="100" height="32" />
                <rect x="0" y="34" width="100" height="32" />
                <rect x="0" y="68" width="100" height="32" />
            </>
        ),
    },
    { // A, B, C side by side
        layout: '{"cells": [["A", "B", "C"]]}',
        svg: (
            <>
                <rect x="0" y="0" width="32" height="100" />
                <rect x="34" y="0" width="32" height="100" />
                <rect x="68" y="0" width="32" height="100" />
            </>
        ),
    },
    { // A on top, B and C below side by side
        layout: '{"cells": [["A"], ["B", "C"]]}',
        svg: (
            <>
                <rect x="0" y="0" width="100" height="49" />
                <rect x="0" y="51" width="49" height="49" />
                <rect x="51" y="51" width="49" height="49" />
            </>
        ),
    },
    { // A and B on top, C full width bottom
        layout: '{"cells": [["A", "B"], ["C"]]}',
        svg: (
            <>
                <rect x="0" y="0" width="49" height="49" />
                <rect x="51" y="0" width="49" height="49" />
                <rect x="0" y="51" width="100" height="49" />
            </>
        ),
    },
    { // A tall left, B & C stacked right
        layout: '{"cells": [["A", "B"], ["A", "C"]]}',
        svg: (
            <>
                <rect x="0" y="0" width="49" height="100" />
                <rect x="51" y="0" width="49" height="49" />
                <rect x="51" y="51" width="49" height="49" />
            </>
        ),
    },
    { // A & B stacked left, C tall right
        layout: '{"cells": [["A", "C"], ["B", "C"]]}',
        svg: (
            <>
                <rect x="0" y="0" width="49" height="49" />
                <rect x="0" y="51" width="49" height="49" />
                <rect x="51" y="0" width="49" height="100" />
            </>
        ),
    },
];

export default function EditorLayout() {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rightTab, setRightTab] = useState(0); // 0=Layout,1=Layers,2=Settings

    const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) console.log("Import JSON:", file.name);
    };

    const addPage = () => setTotalPages((p) => p + 1);

    /** Example layout button click handler */
    const handleLayoutClick = (layout: object) => {
        console.log("Selected Layout:", layout);
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <CssBaseline />

            {/* ===== HEADER / RIBBON ===== */}
            <AppBar
                position="fixed"
                color="inherit"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar sx={{ justifyContent: "space-between", px: 2, py: 1 }}>
                    {/* Left Ribbon Groups */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {/* File */}
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                File
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Tooltip title="Load JSON">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <Box>
                                            <IconButton component="label" size="large">
                                                <InsertDriveFile />
                                                <input hidden type="file" accept=".json" onChange={handleFileImport} />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="caption">Load</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Save Template">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <IconButton size="large">
                                            <Save />
                                        </IconButton>
                                        <Typography variant="caption">Save</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Export as PDF">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <IconButton size="large">
                                            <PictureAsPdf />
                                        </IconButton>
                                        <Typography variant="caption">Export pdf</Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Pages */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                borderLeft: 1,
                                borderColor: "divider",
                                pl: 2,
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                Pages
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Tooltip title="Previous Page">
                                    <span>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <IconButton
                                                size="large"
                                                disabled={page <= 1}
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            >
                                                <ArrowBack />
                                            </IconButton>
                                            <Typography variant="caption">Prev</Typography>
                                        </Box>
                                    </span>
                                </Tooltip>
                                <Typography variant="caption">
                                    Page {page} / {totalPages}
                                </Typography>
                                <Tooltip title="Next Page">
                                    <span>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <IconButton
                                                size="large"
                                                disabled={page >= totalPages}
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            >
                                                <ArrowForward />
                                            </IconButton>
                                            <Typography variant="caption">Next</Typography>
                                        </Box>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Add Page">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <IconButton size="large" onClick={addPage}>
                                            <Add />
                                        </IconButton>
                                        <Typography variant="caption">Add Page</Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Elements */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                borderLeft: 1,
                                borderColor: "divider",
                                pl: 2,
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                Elements
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Tooltip title="Add Text">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <IconButton size="large">
                                            <TextFields />
                                        </IconButton>
                                        <Typography variant="caption">Text</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Add Image">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <IconButton size="large">
                                            <Image />
                                        </IconButton>
                                        <Typography variant="caption">Image</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Add Table">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <IconButton size="large">
                                            <TableChart />
                                        </IconButton>
                                        <Typography variant="caption">Table</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Add Bar Chart">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <IconButton size="large">
                                            <BarChart />
                                        </IconButton>
                                        <Typography variant="caption">Bar Chart</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Add Line Chart">
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <IconButton size="large">
                                            <ShowChart />
                                        </IconButton>
                                        <Typography variant="caption">Line Chart</Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>

                    {/* Center Title */}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        PDF Template Editor
                    </Typography>

                    {/* Right Section */}
                    <Box>
                        <Button variant="contained" size="small" sx={{ bgcolor: "warning.main" }}>
                            Autofill
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ===== LEFT DRAWER ===== */}
            <Drawer
                variant="permanent"
                sx={{
                    width: leftWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: leftWidth,
                        boxSizing: "border-box",
                        backgroundColor: "#f5f5f5",
                    },
                }}
            >
                <Toolbar />
                <Divider />
                <List>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <ListItem button key={i}>
                            <ListItemText primary={`Page ${i + 1}`} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* ===== MAIN CANVAS ===== */}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: "#e0e0e0", p: 3, overflow: "auto" }}
            >
                <Toolbar />
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#333",
                    }}
                >
                    <Box sx={{ width: "100%", height: "100%", backgroundColor: "white", boxShadow: 3 }} />
                </Box>
            </Box>

            {/* ===== RIGHT DRAWER with Tabs ===== */}
            <Drawer
                variant="permanent"
                anchor="right"
                sx={{
                    width: rightWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: rightWidth,
                        boxSizing: "border-box",
                        backgroundColor: "#f5f5f5",
                        p: 2,
                    },
                }}
            >
                <Toolbar />
                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                    Panels
                </Typography>

                <Tabs
                    value={rightTab}
                    onChange={(_, v) => setRightTab(v)}
                    variant="fullWidth"
                    size="small"
                >
                    <Tab label="Layout" />
                    <Tab label="Layers" />
                    <Tab label="Settings" />
                </Tabs>
                <Divider sx={{ my: 1 }} />

                {/* Layout Panel */}
                {rightTab === 0 && (
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            Layout Options
                        </Typography>
                        {/* First cell */}
                        <Box>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontSize: "0.75rem", fontWeight: 600, color: "grey.700", mb: 1 }}
                            >
                                One cell
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1 }}>
                                <IconButton
                                    // onClick={() => onSelect(layout)}
                                    sx={{ p: 0, width: 48, height: 48 }}
                                >
                                    <svg viewBox="0 0 100 100" width="48" height="48">
                                        <rect x="0" y="0" width="100" height="100" fill="currentColor" />
                                    </svg>
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Two cells vertical */}
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontSize: "0.75rem", fontWeight: 600, color: "grey.700", mb: 1 }}
                            >
                                Two cells
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1 }}>
                                {/* Vertical layout: A on top, B on bottom */}
                                <IconButton
                                    className="layout-btn-grid"
                                    // onClick={() => onSelect('{"cells":[["A"],["B"]]}')}
                                    sx={{ p: 0 }}
                                >
                                    <svg viewBox="0 0 100 100" width="48" height="48">
                                        <rect x="0" y="0" width="100" height="49" fill="currentColor" />
                                        <rect x="0" y="51" width="100" height="49" fill="currentColor" />
                                    </svg>
                                </IconButton>

                                {/* Horizontal layout: A left, B right */}
                                <IconButton
                                    className="layout-btn-grid"
                                    // onClick={() => onSelect('{"cells":[["A","B"]]}')}
                                    sx={{ p: 0 }}
                                >
                                    <svg viewBox="0 0 100 100" width="48" height="48">
                                        <rect x="0" y="0" width="49" height="100" fill="currentColor" />
                                        <rect x="51" y="0" width="49" height="100" fill="currentColor" />
                                    </svg>
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Third cell */}
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontSize: "0.75rem", fontWeight: 600, color: "grey.700", mb: 1 }}
                            >
                                Three cells
                            </Typography>

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {layouts.map((item, idx) => (
                                    <IconButton
                                        key={idx}
                                        // onClick={() => onSelect(item.layout)}
                                        sx={{ p: 0, width: 48, height: 48 }}
                                    >
                                        <svg viewBox="0 0 100 100" width="48" height="48">
                                            {item.svg}
                                        </svg>
                                    </IconButton>
                                ))}
                            </Box>
                        </Box>
                        {/* Add more layout SVGs similarly */}
                    </Box>
                )}

                {/* Layers Panel */}
                {rightTab === 1 && (
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            Layers
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Layers will be rendered here.
                        </Typography>
                    </Box>
                )}

                {/* Settings Panel */}
                {rightTab === 2 && (
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Select an element or page to view its settings.
                        </Typography>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
}
