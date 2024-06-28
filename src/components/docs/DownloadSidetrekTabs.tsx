import { SIDETREK_VERSION } from '@/lib/constants'
import BashCode from '../BashCode'
import MyTabs from '../MyTabs'
import Code from '../Code'

export default function DownloadSidetrekTabs() {
  const LinuxWarning = () => (
    <div className="p-3 border border-amber-500 rounded-md bg-amber-50 text-sm mb-4">
      <div className="mb-3">
        Important for Linux users — Make sure you can run Docker without <Code>sudo</Code>. To verify it's running
        correctly, please run <Code>docker run hello-world</Code> (without <Code>sudo</Code>) to make sure it succeeds.
      </div>
      <div className="mb-3">You may need to add your user to docker group first:</div>
      <div>
        <div className="mb-1">
          <Code>sudo groupadd docker</Code>
        </div>
        <div className="mb-1">
          <Code>sudo usermod -aG docker $USER</Code>
        </div>
        <div className="mb-1">
          <Code>newgrp docker</Code>
        </div>
      </div>
    </div>
  )

  const tabs = [
    {
      label: 'macOS ARM',
      value: 'darwin_arm64',
      content: <BashCode code={`curl -fsSL https://sidetrek.com/cli | bash`} />,
      default: true,
    },
    {
      label: 'macOS x64',
      value: 'darwin_x86',
      content: <BashCode code={`curl -fsSL https://sidetrek.com/cli | bash`} />,
    },
    {
      label: 'Linux ARM',
      value: 'linux_arm64',
      content: (
        <div>
          <LinuxWarning />
          <BashCode code={`curl -fsSL https://sidetrek.com/cli | bash`} />
        </div>
      ),
    },
    {
      label: 'Linux x64',
      value: 'linux_x86',
      content: (
        <div>
          <LinuxWarning />
          <BashCode code={`curl -fsSL https://sidetrek.com/cli | bash`} />
        </div>
      ),
    },
  ]

  return <MyTabs variant="underline" tabs={tabs} />
}
