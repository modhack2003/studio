# Shadow terminals

These public simulations distract casual route probing and offer small CTFs. They are not an authentication layer, an intrusion detector, or a substitute for the real admin's session checks.

| Route | Experience |
| --- | --- |
| `/admin` | Fake PIN console |
| `/administrator` | Fake system administration login |
| `/wp-admin` | Fake content administration login (no WordPress installed) |
| `/cpanel` | Fake hosting login (no cPanel installed) |
| `/admin/login` | Fake operator login |
| `/dashboard/login` | Fake dashboard login |
| `/b1kr4m-5h4d0w` | Five-lock cipher CTF |
| `/admin/access` | Alternate entrance to cipher CTF |
| `/admin/backup` | Three-lock archive CTF |
| `/root` | Three-lock signal CTF |

Login inputs remain only in React memory and are cleared immediately when submitted. No login requests, database writes, credential storage, or real admin imports are involved. The timer is cleaned up when leaving a page.

CTF verification accepts only a recognized track, integer level, and answer up to 128 characters. Answers stay in the server route. Completion returns fictional flags and never sets an admin cookie or redirects to the real login. Flags are game rewards, not proof of identity; players can inspect or probe the public verifier.

The verifier has a bounded 2,048-entry per-instance throttle (20 attempts per minute) with expired-entry cleanup and Retry-After responses. This is best-effort on Vercel; it is not a globally coordinated rate limit. Responses are not cached. Decoy pages have noindex/nofollow metadata and headers without advertising the route inventory in robots.txt.

No new packages, database schema changes, or environment variables are required.
