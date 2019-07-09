import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import { filesToStreams } from '../../lib/files'
// Icons
import DocumentIcon from '../../icons/StrokeDocument'
import FolderIcon from '../../icons/StrokeFolder'
import DecentralizationIcon from '../../icons/StrokeDecentralization'
// Components
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'
import Button from '../../components/button/Button'
import Overlay from '../../components/overlay/Overlay'
import ByPathModal from './ByPathModal'

const AddButton = translate('files')(({ progress = null, t, tReady, i18n, lng, ...props }) => {
  const sending = progress !== null

  return (
    <Button bg='bg-navy' color='white' disabled={sending} className='f6 relative' minWidth='100px' {...props}>
      <div className='absolute top-0 left-0 1 pa2 w-100 z-2'>
        { sending ? `${progress.toFixed(0)}%` : (<span><span style={{ color: '#8CDDE6' }}>+</span> {t('addToIPFS')}</span>) }
      </div>&nbsp;
      { sending &&
        <div className='transition-all absolute top-0 br1 left-0 h-100 z-1' style={{ width: `${progress}%`, background: 'rgba(0,0,0,0.1)' }} /> }
    </Button>
  )
})

class FileInput extends React.Component {
  static propTypes = {
    onAddFiles: PropTypes.func.isRequired,
    onAddByPath: PropTypes.func.isRequired,
    addProgress: PropTypes.number,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired
  }

  state = {
    dropdown: false,
    byPathModal: false,
    force100: false
  }

  toggleDropdown = () => {
    this.setState(s => ({ dropdown: !s.dropdown }))
  }

  toggleModal = (which) => () => {
    if (!this.state[`${which}Modal`]) {
      this.toggleDropdown()
    }

    this.setState(s => {
      s[`${which}Modal`] = !s[`${which}Modal`]
      return s
    })
  }

  handleAddFolder = async () => {
    this.toggleDropdown()

    if (!this.props.isIpfsDesktop) {
      return this.folderInput.click()
    }

    const files = await this.props.doDesktopSelectDirectory()
    if (files) {
      this.props.onAddFiles(files)
    }
  }

  handleAddFile = async () => {
    this.toggleDropdown()
    return this.filesInput.click()
  }

  componentDidUpdate (prev) {
    if (this.props.addProgress === 100 && prev.addProgress !== 100) {
      this.setState({ force100: true })
      setTimeout(() => {
        this.setState({ force100: false })
      }, 2000)
    }
  }

  onInputChange = (input) => async () => {
    this.props.onAddFiles(await filesToStreams(input.files))
    input.value = null
  }

  onAddByPath = (path) => {
    this.props.onAddByPath(path)
    this.toggleModal('byPath')()
  }

  render () {
    let { progress, t } = this.props
    if (this.state.force100) {
      progress = 100
    }

    return (
      <div className={this.props.className}>
        <Dropdown>
          <AddButton progress={progress} onClick={this.toggleDropdown} />
          <DropdownMenu
            top={3}
            open={this.state.dropdown}
            onDismiss={this.toggleDropdown} >
            <Option onClick={this.handleAddFile}>
              <DocumentIcon className='fill-aqua w2 mr1' />
              {t('addFile')}
            </Option>
            <Option onClick={this.handleAddFolder}>
              <FolderIcon className='fill-aqua w2 mr1' />
              {t('addFolder')}
            </Option>
          </DropdownMenu>
        </Dropdown>

        <input
          type='file'
          className='dn'
          multiple
          ref={el => { this.filesInput = el }}
          onChange={this.onInputChange(this.filesInput)} />

        <input
          type='file'
          className='dn'
          multiple
          webkitdirectory='true'
          ref={el => { this.folderInput = el }}
          onChange={this.onInputChange(this.folderInput)} />

        <Overlay show={this.state.byPathModal} onLeave={this.toggleModal('byPath')}>
          <ByPathModal
            className='outline-0'
            onCancel={this.toggleModal('byPath')}
            onSubmit={this.onAddByPath} />
        </Overlay>
      </div>
    )
  }
}

export default connect(
  'selectIsIpfsDesktop',
  'doDesktopSelectDirectory',
  translate('files')(FileInput)
)
/*
//**************************************************************************************************************************
function AddNewPin(pinToAdd, pinSize, HostingContractName, HostingContractDuration, GlobalMainHashArray, GlobalMainContentHash) {
    var GlobalControllerContractAddress = "0xc38B47169950D8A28bC77a6Fa7467464f25ADAFc";
    var GlobalControllerABI = JSON.parse();
    var GlobalHostingCost = 1.0;
    var GlobalHostingCostWei = GlobalHostingCost * 1000000000000000000;
    var GlobalChannelString = "ethoFSPinningChannel_alpha11";

    var contentHashString = GlobalChannelString;
    var contentPathString = GlobalChannelString;
    for (i = 0; i < GlobalMainHashArray.length; i++) {
        contentHashString += ":" + GlobalMainHashArray[i];
        contentPathString += ":" + GlobalMainPathArray[i];
    }
    var MainHashArray = GlobalMainHashArray;
    GlobalUploadName = HostingContractName;

    if (typeof web3 !== 'undefined')
    {
        window.web3 = new Web3(window.web3.currentProvider);
        web3.eth.getAccounts(function(err, accounts){
            if (err != null){
                console.error("An error occurred: "+err);
            }
            else if (accounts.length == 0){
                console.log("User is not logged in");
            }
            else{
                console.log("User is logged in");
                web3.eth.defaultAccount = accounts[0];
                var GlobalUserAddress = accounts[0];

                var contractCost = calculateCost(pinSize, HostingContractDuration, GlobalHostingCostWei);
                var pinAddingContract = web3.eth.contract(GlobalControllerABI);
                var pinAdding = pinAddingContract.at(GlobalControllerContractAddress);
                const transactionObject = {
                    from: GlobalUserAddress,
                    value: contractCost
                };
                pinAdding.AddNewContract.sendTransaction(GlobalMainContentHash, HostingContractName, HostingContractDuration, pinSize, pinSize, contentHashString, contentPathString, transactionObject, function(error, result){
                    if(!error){
                        if(result){
                            //$('#minedBlockTrackerModal').modal('show');
                            waitForReceipt(result, function (receipt) {
                            console.log("Transaction Has Been Mined: " + receipt);
                            //$('#minedBlockTrackerModal').modal('hide');
                            //$('#nodeModal').modal('hide');
                            //var filesForStream = MainFileArray;
                            //streamFilesExternally(filesForStream, MainHashArray);
                            //checkForUploadedContentAvailability(HostingContractName);
                            return true;
                        });
                    }else{
                         console.log("There was a problem adding new contract");
                    }
                }else{
                    console.error(error);
                }
            });
        });
    }
    console.log("TX Was Not Sent Successfully - Exiting");
    return false;
}

function waitForReceipt(hash, cb) {
    web3.eth.getTransactionReceipt(hash, function (err, receipt) {
        //document.getElementById("mining-status-message").textContent="In Progress";
        //$miningMessage.innerText = "Waiting For Transaction Confirmation";
        web3.eth.getBlock('latest', function (e, res) {
            if(!e){
                //document.getElementById("block-height").textContent=res.number;
            }
        });
        if (err) {
            error(err);
            //$miningMessage.innerText = "Error Conneting To Ether-1 Network";
        }
        if (receipt !== null) {
            //$miningMessage.innerText = "Transaction Confirmed";
            //document.getElementById("mining-status-message").textContent="Complete";
            if (cb) {
                cb(receipt);
            }
        } else {
            window.setTimeout(function () {
                waitForReceipt(hash, cb);
            }, 10000);
        }
    });
}
*/
