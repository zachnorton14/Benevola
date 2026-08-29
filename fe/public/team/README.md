# Team photos

Drop the three headshots here, named exactly as `TEAM` in
`src/variants/default/pages/About.jsx` expects:

    zachary-norton.jpg
    talha-djibril.jpg
    owen-voorhees.jpg

Anything in `public/` is copied to the site root at build time, so
`/team/zachary-norton.jpg` resolves once the file exists. Until then the About
page shows the person's initial instead — a missing file is not a broken image.

## Getting them off LinkedIn

You cannot point `photo` at a LinkedIn URL. `media.licdn.com` serves
time-limited signed URLs that expire within days, and it blocks hotlinking from
other origins, so the images would 404 shortly after you set them.

Save each photo instead: open the profile, right-click the picture, Save image
as, and put it here under the name above.

## Worth doing before you commit them

Square them and keep them small. They render at 92px (about 184px on a retina
screen), so anything past ~400x400 is bytes nobody sees. JPEG at ~80% quality
is plenty.

Use a photo the person is happy to have on a public page.
