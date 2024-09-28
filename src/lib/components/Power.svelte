<script lang="ts">
  import { Power } from 'svelte-bootstrap-icons';
  import axios from 'axios';
  import { getUrlWithNoPort } from '$lib/logic/main';
  import { _0Square, _1Square, _2Square, _3Square, _4Square, _5Square, _6Square, _7Square, _8Square, _9Square } from 'svelte-bootstrap-icons';
  import { ArrowLeftSquare } from 'svelte-bootstrap-icons';

  var Square0 = _0Square
  var Square1 = _1Square
  var Square2 = _2Square
  var Square3 = _3Square
  var Square4 = _4Square
  var Square5 = _5Square
  var Square6 = _6Square
  var Square7 = _7Square
  var Square8 = _8Square
  var Square9 = _9Square

  let code:string = ""
  let shutdownRequest:boolean = false;
  let shutDownCode:number = 0;

  async function send() {
    console.log("ciao");
    try {
      const response = await axios.post(getUrlWithNoPort() + ':3000/shutdown', {
        code: code
      }, {
        withCredentials: true
      });
      console.log('Shutdown initiated:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function CodeRequest() {
    try {
      const response = await axios.get(getUrlWithNoPort() + ':3000/shutdownCode', {
        withCredentials: true
      });
      shutdownRequest = true;
      shutDownCode = response.data.code;
      code = ""
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function CodeReset() {
    try {
      const response = await axios.post(getUrlWithNoPort() + ':3000/shutdownReset', {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function PowerOff() {
    send();
  }

  function Cancel() {
    shutdownRequest = false;
    CodeReset()
  }

  function ShutDown() {
    CodeRequest();
  }
</script>

<button on:click={ShutDown}>
  <Power class="h-8 w-8 ml-4 text-red mt-0.5 hover:ring rounded-lg ring-red hover:cursor-pointer"/>
</button>

{#if shutdownRequest}
<div class="fixed z-10 inset-0 overflow-y-auto">
  <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 transition-opacity" aria-hidden="true">
      <div class="absolute inset-0 opacity-75"></div>
    </div>

    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

    <div class="inline-block align-bottom bg-gray rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-mid-gray dark:bg-black-gray px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="dark:text-white text-lg leading-6 font-medium text-gray-900" id="modal-headline">
              Shutdown Device
            </h3>
            <div class="mt-2">
              <p class="dark:text-white text-sm">
                Insert the code displayed and press Power Off to shutdown the system
              </p>
              <p class="dark:text-white text-xl mt-2">
                Code: {shutDownCode}
              </p>
              <div class="flex justify-around mt-4 flex-col mx-32">
                <div>
                  <button on:click={() => code += 1} class="btn btn-primary"><Square1 class="w-10 h-10 m-2 active:bg-gray"/></button>
                  <button on:click={() => code += 2} class="btn btn-primary"><Square2 class="w-10 h-10 m-2 active:bg-gray"/></button>
                  <button on:click={() => code += 3} class="btn btn-primary"><Square3 class="w-10 h-10 m-2 active:bg-gray"/></button>
                </div>
                <div>
                  <button on:click={() => code += 4} class="btn btn-primary"><Square4 class="w-10 h-10 m-2 active:bg-gray"/></button>
                  <button on:click={() => code += 5} class="btn btn-primary"><Square5 class="w-10 h-10 m-2 active:bg-gray"/></button>
                  <button on:click={() => code += 6} class="btn btn-primary"><Square6 class="w-10 h-10 m-2 active:bg-gray"/></button>
                </div>
                <div>
                  <button on:click={() => code += 7} class="btn btn-primary"><Square7 class="w-10 h-10 m-2 active:bg-gray"/></button>
                  <button on:click={() => code += 8} class="btn btn-primary"><Square8 class="w-10 h-10 m-2 active:bg-gray"/></button>
                  <button on:click={() => code += 9} class="btn btn-primary"><Square9 class="w-10 h-10 m-2 active:bg-gray"/></button>
                </div>
                <div>
                  <button on:click={() => code += 0} class="ml-2 btn btn-primary"><Square0 class="ml-16 w-10 h-10 m-2 active:bg-gray"/></button>
                  <button on:click={() => code = code.slice(0, -1)} class="btn btn-primary"><ArrowLeftSquare class="w-10 h-10 m-2 active:bg-gray"/></button>
                </div>
                <div class="dark:text-white text-xl mt-2">
                  Typed: {code}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="dark:bg-mid-black-gray bg-white-gray px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button type="button" class="mb-2 dark:bg-black-gray bg-mid-gray w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium dark:text-white ring-2 ring-gray dark:ring-white hover:bg-red hover:dark:bg-red sm:ml-3 sm:w-auto sm:text-sm" on:click={PowerOff}>
          Power Off
        </button>
        <button type="button" class="mb-2 dark:bg-black-gray bg-mid-gray w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium dark:text-white ring-2 ring-gray dark:ring-white hover:bg-gray hover:dark:bg-mid-black-gray sm:ml-3 sm:w-auto sm:text-sm" on:click={Cancel}>
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
{/if}
