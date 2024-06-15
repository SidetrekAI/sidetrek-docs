import { SIDETREK_VERSION } from '@/lib/constants'
import BashCode from '../BashCode'
import MyTabs from '../MyTabs'

export default function DownloadSidetrekTabs() {
  const tabs = [
    {
      label: 'macOS x64',
      value: 'darwin_x86',
      content: (
        <BashCode
          code={`curl -fsSL https://sidetrek.com/cli.sh | sh`}
        />
      ),
      default: true,
    },
    {
      label: 'macOS ARM',
      value: 'darwin_arm64',
      content: (
        <BashCode
          code={`curl -fsSL https://sidetrek.com/cli.sh | sh`}
        />
      ),
    },
    {
      label: 'Linux x64',
      value: 'linux_x86',
      content: (
        <BashCode code={`curl -fsSL https://sidetrek.com/cli.sh | sh`} />
      ),
    },
    {
      label: 'Linux ARM',
      value: 'linux_arm64',
      content: (
        <BashCode
          code={`curl -fsSL https://sidetrek.com/cli.sh | sh`}
        />
      ),
    },
  ]

  return <MyTabs variant="underline" tabs={tabs} />
}
