# One Sound

Chrome extension which create a kind of a media chain, so exactly in one moment will play only one media provider and another providers will wait untill current provider will be paused or delited.

## Supported providers
- HTML5 audio and video - should work with every page with this elements
- HTML5 AJAX audio and video - works on pages with ajax page reload, now works on:
    - Youtube
- Yandex Music

## Known issues
- Youtube: 
    - Go to video page
    - Play video
    - Go to chanel of this video
    - _Expected result_ : video from video page deleted from chain and main video of channel added to chain
    - _Current result_ : video from video page still presented in chain and main video of channel not added to chain
- Vk:
    - Play some audio
    - Stop this audio via chain (open new audio in new tab for example)
    - Go to audio page
    - _Expected result_ : audio should be stopped and player button should be with play icon on it
    - _Expected result_ : audio should is stopped but player button is with pause icon on it
