import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from tests.test_gateway import TestGatewayEngine

if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestGatewayEngine)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(not result.wasSuccessful())
