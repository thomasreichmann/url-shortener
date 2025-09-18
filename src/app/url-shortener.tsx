"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { api } from "~/trpc/react";

export default function UrlShortener() {
  const [input, setInput] = useState("");

  const utils = api.useUtils();
  const recentQuery = api.url.getRecent.useQuery(undefined, {
    staleTime: 5_000,
  });
  const shorten = api.url.shorten.useMutation({
    onSuccess: async () => {
      await utils.url.invalidate();
      setInput("");
    },
  });

  const base = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <Container
      maxWidth="sm"
      className="flex min-h-screen items-center justify-center"
    >
      <Box className="flex w-full flex-col gap-6 py-16">
        <Typography variant="h4" className="text-center font-bold">
          Simple URL Shortener
        </Typography>
        <Paper elevation={3} className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              shorten.mutate({ originalUrl: input.trim() });
            }}
            className="flex gap-2"
          >
            <TextField
              fullWidth
              label="Paste a URL to shorten"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={shorten.isPending}
            >
              {shorten.isPending ? "Shortening..." : "Shorten"}
            </Button>
          </form>
        </Paper>

        <Box>
          <Typography variant="h6" className="mb-2">
            Recent URLs
          </Typography>
          <Paper variant="outlined">
            <List>
              {recentQuery.data?.length ? (
                recentQuery.data.map((row) => {
                  const shortUrl = `${base}/${row.id}`;
                  return (
                    <ListItem
                      key={row.id}
                      divider
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="copy"
                          onClick={() =>
                            navigator.clipboard?.writeText(shortUrl)
                          }
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <span className="block truncate">
                            <a
                              href={shortUrl}
                              className="text-blue-500 hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {shortUrl}
                            </a>
                          </span>
                        }
                        secondary={
                          <span className="block truncate">
                            <a
                              href={row.originalUrl}
                              className="hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {row.originalUrl}
                            </a>
                          </span>
                        }
                      />
                    </ListItem>
                  );
                })
              ) : (
                <ListItem>
                  <ListItemText primary="No URLs yet." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
