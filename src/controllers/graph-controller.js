const { StatusCodes } = require('http-status-codes'); // HTTP 상태 코드 라이브러리
const GraphService = require('../services/graph-service');


let graphServiceInstance; // 그래프 상태를 메모리에 유지하기 위한 변수

const GraphController = {
  /**
   * Initialize the graph and store it in memory
   */
  async initializeGraph(req, res) {
    try {
      // Create a new instance of the GraphService
      graphServiceInstance = new GraphService();

      // Build the graph using the service
      const graph = await graphServiceInstance.buildGraph();

      // Return a success response
      return res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: 'Graph successfully created.',
        graph,
      });
    } catch (error) {
      console.error('❌ Error initializing graph:', error.message);

      // Return an error response
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Error creating graph',
        error: error.message,
      });
    }
  },

  /**
   * Return the current state of the graph
   */
  getGraphState(req, res) {
    try {
      // Check if the graph has been initialized
      if (!graphServiceInstance || !graphServiceInstance.getGraph()) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: 'Graph not found. Please initialize the graph first.',
        });
      }

      // Return the current graph state
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Graph state retrieved successfully.',
        graph: graphServiceInstance.getGraph(),
      });
    } catch (error) {
      console.error('❌ Error fetching graph state:', error.message);

      // Return an error response
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Error fetching graph state',
        error: error.message,
      });
    }
  },
};

module.exports = GraphController;
