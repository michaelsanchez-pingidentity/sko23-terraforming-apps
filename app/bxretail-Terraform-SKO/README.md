# BXRetail Terraform Lab for SKO 2023

## Introduction
BXRetail Terraform Lab is a stripped down version of the live BXRetail application found at https://demo.bxretail.org/app/. This is a lab developed by Ping Identity's Technical Enablement demo team to showcase a real-world custom application being deployed by, and integrated with PingOne, using Terraform. 

Because this version of BXRetail was revamped with a focus on the Terraform integration, most of the features and functionality you see in the live BXRetail have either been removed or disabled, including the code, to...

1. Keep the focus on the Terraform integration and training.
2. Avoid confusion of multiple versions of BXRetail existing.
3. Avoid complexity for those looking into the code, having to dig through 10 thousand of lines of code that weren't being used.

This application source includes the Dockerfile.dev we used to build the app image for the lab and the env.sh shell script used to dynamically update env vars at runtime as the container comes up.

BXRetail is a Single Page Application (SPA) built with React; JSX, Javascript, react-router, react-strap, SASS, JSON.

FOR QUESTIONS:
- Michael Sanchez at Slack #bxdemos-pingpowered
- Chris Price at Slack ... everywhere.


# Disclaimer
THIS DEMO AND SAMPLE CODE IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS DEMO AND SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.