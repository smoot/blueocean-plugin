// @flow

import React, { Component, PropTypes } from 'react';
import { EditorPipelineGraph } from './EditorPipelineGraph';
import { EditorStepList } from './EditorStepList';
import { EditorStepDetails } from './EditorStepDetails';
import Extensions from '@jenkins-cd/js-extensions';

import type { StageInfo, StepInfo } from './common';

type Props = {
    stages: Array<StageInfo>,
    stageSteps: {[stageId:number]: Array<StepInfo> }
};

type State = {
    s?: bool, // TODO: RM
    stages: Array<StageInfo>,
    stageSteps: {[stageId:number]: Array<StepInfo> },
    selectedStage: ?StageInfo,
    selectedStep: ?StepInfo
};


function _copy(obj) {
    // TODO: This is awful, use a lib
    return JSON.parse(JSON.stringify(obj));
}

let idSeq = -11111;

function createBasicStage(name:string):StageInfo {
    return {
        name,
        id: idSeq--,
        children: []
    };
}

const ss = {
    // TODO: RM
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "#eee",
    backgroundImage: "url(http://www.iywib.com/soon_19.jpg)",
    marginLeft: "-250px",
    marginTop: "-250px",
    left: "50%",
    top: "50%"
};

type DefaultProps = typeof EditorMain.defaultProps;
export class EditorMain extends Component<DefaultProps, Props, State> {

    static defaultProps = {};

    //static propTypes = {...}
    // TODO: React proptypes ^^^

    props:Props;
    state:State;

    constructor(props:Props) {
        super(props);
        this.state = {
            stages: _copy(props.stages),
            stageSteps: _copy(props.stageSteps),
            selectedStage: null,
            selectedStep: null
        };
    }

    componentWillReceiveProps(nextProps:Props) {
        this.handleProps(nextProps);
    }

    handleProps(nextProps:Props) {

        let updates = {};

        if (nextProps.stages !== this.props.stages) {
            updates.stages = _copy(nextProps.stages);
        }

        if (nextProps.stageSteps !== this.props.stageSteps) {
            updates.stageSteps = _copy(nextProps.stageSteps);
        }

        this.setState(updates);
    }

    getStepsForStage(stage:StageInfo):Array<StepInfo> {
        const stageId = stage.id;
        return this.state.stageSteps[stageId] || [];
    }

    graphSelectedStageChanged(newSelectedStage:?StageInfo) {
        // TODO: Select first step?
        this.setState({selectedStage: newSelectedStage, selectedStep: null});
    }

    createSequentialStage(name:string) {
        const {stages, stageSteps} = this.state;

        let newStage = createBasicStage(name);
        const stageId = newStage.id;

        this.setState({
            stages: [...stages, newStage],
            stageSteps: {...stageSteps, [stageId]: []},
            selectedStage: newStage
        });
    }

    createParallelStage(name:string, parentStage:StageInfo) {

        const oldStages = this.state.stages;
        const oldStageSteps = this.state.stageSteps;
        const parentStageIndex = oldStages.indexOf(parentStage);

        if (parentStageIndex === -1) {
            console.error("Could not find parent stage", parentStage, "in top-level stage list");
            return;
        }

        let updatedChildren = [...parentStage.children]; // Start with a shallow copy, we'll add one or two to this
        let updatedStageSteps = {...oldStageSteps}; // Shallow copy, we'll need to at least add one

        let newStage = createBasicStage(name);
        updatedStageSteps[newStage.id] = []; // Empty steps list for now, let the user work from a blank list

        if (parentStage.children.length == 0) {
            // Converting a normal stage with steps into a container of parallel branches, so there's more to do
            let zerothStage = createBasicStage(parentStage.name);

            // Move any steps from the parent stage into the new zeroth stage
            updatedStageSteps[zerothStage.id] = oldStageSteps[parentStage.id];
            updatedStageSteps[parentStage.id] = []; // Stages with children can't have steps

            updatedChildren.push(zerothStage);
        }

        updatedChildren.push(newStage); // Add the user's newStage to the parent's child list

        let updatedParentStage = {...parentStage, children: updatedChildren};

        // Build a new stages list
        let updatedStages = [
            ...(oldStages.slice(0, parentStageIndex)),
            updatedParentStage,
            ...(oldStages.slice(parentStageIndex + 1))
        ];

        // "save" our updates to the model
        this.setState({
            stages: updatedStages,
            stageSteps: updatedStageSteps,
            selectedStage: newStage
        });
    }

    createStep() {
        console.log("main.createStep()"); // TODO: RM

        const {selectedStage, stageSteps} = this.state;

        if (!selectedStage) {
            return;
        }

        const oldStepsForStage = stageSteps[selectedStage.id] || [];

        let newStep:StepInfo = {
            id: --idSeq,
            isContainer: false,
            children: [],
            type: "script",
            label: "Run Script",
            data: ""
        };

        let newStepsForStage = [...oldStepsForStage, newStep];
        let newStageSteps = {...stageSteps, [selectedStage.id]: newStepsForStage};

        this.setState({stageSteps: newStageSteps, selectedStep: newStep});
        // TODO: Select new step!
    }

    selectedStepChanged(selectedStep:StepInfo) {
        this.setState({selectedStep});
    }

    deleteStep(step:StepInfo) {
        const {selectedStage, stageSteps} = this.state;

        if (!selectedStage) {
            return;
        }

        const oldStepsForStage = stageSteps[selectedStage.id] || [];

        const stepIdx = oldStepsForStage.indexOf(step);

        if (stepIdx < 0) {
            return;
        }

        let newStepsForStage = [
            ...(oldStepsForStage.slice(0, stepIdx)),
            ...(oldStepsForStage.slice(stepIdx + 1))
        ];

        let newSelectedStepIdx = Math.min(stepIdx, newStepsForStage.length - 1);
        let newSelectedStep = newStepsForStage[newSelectedStepIdx];

        let newStageSteps = {...stageSteps, [selectedStage.id]: newStepsForStage};

        this.setState({
            stageSteps: newStageSteps,
            selectedStep: newSelectedStep
        });
    }

    stepDataChanged(newValue:any) {

        const {stageSteps, selectedStage, selectedStep} = this.state;

        if (!stageSteps || !selectedStage || !selectedStep) {
            return;
        }

        const stepsForStage = stageSteps[selectedStage.id];
        const stepIndex = stepsForStage.indexOf(selectedStep);

        let updatedStep = {...selectedStep, data: newValue};
        let updatedStepsForStage = [
            ...(stepsForStage.slice(0, stepIndex)),
            updatedStep,
            ...(stepsForStage.slice(stepIndex + 1))
        ];
        let updatedStageSteps = {...stageSteps, [selectedStage.id]: updatedStepsForStage};

        this.setState({
            stageSteps: updatedStageSteps,
            selectedStep: updatedStep
        });
    }

    deleteStageClicked(e:HTMLEvent) {
        console.error("TODO: Delete stage functionality");
        e.target.blur();
        this.setState({s: true});
    }

    render() {

        const {stages, selectedStage, selectedStep, s} = this.state;
        const steps = selectedStage ? this.getStepsForStage(selectedStage) : [];

        const title = selectedStage ? selectedStage.name : 'Select or create a build stage';
        const disableIfNoSelection = selectedStage ? {} : {disabled: 'disabled'};

        let sv = s ? "visible" : "hidden";

        return (
            <div className="editor-main">
                <div className="editor-main-graph">
                    <EditorPipelineGraph stages={stages}
                                         selectedStage={selectedStage}
                                         onStageSelected={(stage) => this.graphSelectedStageChanged(stage)}
                                         onCreateSequentialStage={(name) => this.createSequentialStage(name)}
                                         onCreateParallelStage={(name, parentStage) => this.createParallelStage(name, parentStage)}/>
                </div>
                <div className="editor-main-selection-title">
                    <h4>{title}</h4>
                    <div className="editor-button-bar">
                        <button className="btn-secondary editor-delete-btn"
                            {...disableIfNoSelection}
                                onClick={(e) => this.deleteStageClicked(e)}>
                            Delete stage
                        </button>
                    </div>
                </div>
                <div className="editor-main-step-list">
                    {selectedStage ? <EditorStepList steps={steps}
                                                     selectedStep={selectedStep}
                                                     onAddStepClick={() => this.createStep()}
                                                     onStepSelected={(step) => this.selectedStepChanged(step)}
                                                     onDeleteStepClick={(step) => this.deleteStep(step)}/>
                        : <p>Select or create a build stage</p>}
                </div>
                <div className="editor-main-step-details">
                    <Extensions.Renderer extensionPoint="pipeline.editor.css"/>
                    {selectedStage ? <EditorStepDetails step={selectedStep}
                                                        onDataChange={newValue => this.stepDataChanged(newValue)}
                                                        onDeleteStepClick={(step) => this.deleteStep(step)}/>
                        : <p>Select or create a build stage</p>}
                </div>
                <div id="soon" style={{...ss, visibility: sv}} onClick={()=>this.setState({s: false})}>&nbsp;</div>
            </div>
        );
    }
}
